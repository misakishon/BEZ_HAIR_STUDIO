import React, { useEffect, useState, useCallback } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Header from "../components/header";
import StepIndicator from "./stepservice";

interface Hairstyle {
    id: number;
    name: string;
    price: number | string;
    duration_minutes: number;
    image_path: string | null;
}

interface Barber {
    id: number;
    full_name: string;
    specialty: string | null;
}

interface BookingStep4Props {
    hairstyle: Hairstyle | null;
    barber: Barber | null;
    barberId: number;
    hairstyleId: number;
    bookingDate: string;
    bookingTime: string;
    paymentMethod: string;
    fullName?: string;
    email?: string;
    phone?: string;
    paymentError?: string | null;
}

type PaymentMethod = "cash" | "gcash";
type GCashStatus = "idle" | "pending" | "paid" | "error";

const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-").map(Number);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return `${months[m - 1]} ${d}, ${y}`;
};

const formatTime = (timeStr: string): string => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export default function BookingStep4({
    hairstyle,
    barber,
    barberId,
    bookingDate,
    bookingTime,
    paymentMethod: initialPaymentMethod,
    fullName = "",
    email = "",
    phone = "",
    paymentError = null,
}: BookingStep4Props) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
        (initialPaymentMethod as PaymentMethod) || "cash",
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gcashLoading, setGcashLoading] = useState(false);
    const [gcashError, setGcashError] = useState<string | null>(paymentError);
    const [gcashQrCode, setGcashQrCode] = useState<string | null>(null);
    const [gcashStatus, setGcashStatus] = useState<GCashStatus>("idle");

    // Price calculation
    const getPrice = (): number => {
        if (!hairstyle) return 250;
        const rawPrice =
            typeof hairstyle.price === "string"
                ? parseFloat(hairstyle.price)
                : hairstyle.price;
        return rawPrice || 250;
    };

    const { props } = usePage<any>();
    const displayPriceValue =
        props && props.displayPrice !== undefined && props.displayPrice !== null
            ? Number(props.displayPrice)
            : null;
    const price = (
        displayPriceValue !== null ? displayPriceValue : Number(getPrice())
    ).toFixed(2);
    const barberName = barber
        ? barber.full_name
        : barberId === 0
          ? "Any Available"
          : "—";
    const displayDate = formatDate(bookingDate);
    const displayTime = formatTime(bookingTime);

    const getCsrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";

    const getAppUrl = useCallback((path: string) => {
        if (typeof window === "undefined") return path;
        const currentPath = window.location.pathname || "/";
        const bookingIndex = currentPath.indexOf("/booking/");
        const basePath =
            bookingIndex > -1 ? currentPath.slice(0, bookingIndex) : "";
        return `${window.location.origin}${basePath}${path.startsWith("/") ? path : `/${path}`}`;
    }, []);

    // Handle Cash Submission via Inertia
    const handleSubmitCash = (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentMethod !== "cash") {
            alert(
                "Please select Cash to confirm booking, or switch to QR PH to pay with GCash.",
            );
            return;
        }

        setIsSubmitting(true);
        router.post(
            getAppUrl("/booking/step-4"),
            { payment_method: "cash" },
            {
                onError: (errors) => {
                    console.error("Payment error:", errors);
                    const msg =
                        errors?.message || "Payment failed. Please try again.";
                    alert(msg);
                    setIsSubmitting(false);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    // Handle Initiate QR PH Payment
    const handleGcashPay = async () => {
        if (paymentMethod !== "gcash") {
            alert("Select QR PH to pay with GCash.");
            return;
        }

        setGcashLoading(true);
        setGcashError(null);
        setGcashQrCode(null);

        try {
            const res = await fetch(getAppUrl("/booking/payment/gcash"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
                body: JSON.stringify({ name: fullName, email, phone }),
            });

            const data = await res.json();

            if (data.success && data.checkout_url) {
                window.location.href = data.checkout_url;
                return;
            }

            if (data.success && data.qr_code) {
                setGcashQrCode(data.qr_code);
                setGcashStatus("pending");
                return;
            }

            setGcashStatus("error");
            setGcashError(
                data.message ||
                    "Could not start QR PH payment. Please try again.",
            );
        } catch (err) {
            console.error("QR PH initiate error:", err);
            setGcashStatus("error");
            setGcashError("Something went wrong. Please try again.");
        } finally {
            setGcashLoading(false);
        }
    };

    const handleDownloadQr = async (url: string) => {
        try {
            setGcashLoading(true);
            const res = await fetch(url, { mode: "cors" });
            if (!res.ok) throw new Error("Failed to fetch QR image");
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `BEZ_QR_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download QR error:", err);
            alert(
                "Unable to download QR image. Try opening it and saving manually.",
            );
        } finally {
            setGcashLoading(false);
        }
    };

    // Poll QR PH Payment Status
    useEffect(() => {
        if (gcashStatus !== "pending") return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(
                    getAppUrl("/booking/payment/gcash/status"),
                    {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    },
                );

                const data = await res.json();

                if (data.success && data.paid) {
                    clearInterval(interval);
                    if (data.redirect_url) {
                        window.location.href = data.redirect_url;
                    } else {
                        setGcashStatus("paid");
                    }
                }
            } catch (err) {
                console.error("QR PH status polling error:", err);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [gcashStatus, getAppUrl]);

    const paymentOptions: {
        value: PaymentMethod;
        label: string;
        description: string;
        icon: string;
    }[] = [
        {
            value: "cash",
            label: "Cash",
            description: "Pay at the studio after your service.",
            icon: "payments",
        },
        {
            value: "gcash",
            label: "GCash",
            description: "Pay securely via QR PH using GCash.",
            icon: "smartphone",
        },
    ];

    return (
        <>
            <Head title="Payment Method — BEZ Hair Studio" />
            <Header />

            <main className="min-h-screen bg-white pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
                    <StepIndicator currentStep={4} />

                    <div className="grid md:grid-cols-2 gap-8 items-start mt-8">
                        {/* Booking Summary */}
                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-4">
                                Booking Summary
                            </h3>

                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="flex gap-4 p-5 border-b border-gray-100 items-center">
                                    <div>
                                        <p className="text-[13px] text-gray-500 font-light tracking-wide">
                                            {hairstyle?.duration_minutes ??
                                                "--"}{" "}
                                            min ·{" "}
                                            <span className="font-normal text-gray-700">
                                                ₱{price}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 space-y-2">
                                    {[
                                        { label: "Barber", value: barberName },
                                        { label: "Date", value: displayDate },
                                        { label: "Time", value: displayTime },
                                        {
                                            label: "Location",
                                            value: "Studio Branch",
                                        },
                                    ].map(({ label, value }) => (
                                        <div
                                            key={label}
                                            className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0"
                                        >
                                            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.12em]">
                                                {label}
                                            </span>
                                            <span className="text-[14px] font-medium text-gray-800">
                                                {value}
                                            </span>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-200">
                                        <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-[0.12em]">
                                            Total
                                        </span>
                                        <span className="text-[24px] font-bold text-amber-600 tracking-tight">
                                            ₱{price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-4">
                                Choose Payment
                            </h3>

                            <form
                                onSubmit={handleSubmitCash}
                                className="space-y-4"
                            >
                                <div className="space-y-3">
                                    {paymentOptions.map((option) => {
                                        const isActive =
                                            paymentMethod === option.value;
                                        return (
                                            <label
                                                key={option.value}
                                                onClick={() => {
                                                    setPaymentMethod(
                                                        option.value,
                                                    );
                                                    setGcashError(null);
                                                }}
                                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                    isActive
                                                        ? "border-black bg-gray-50 shadow-sm ring-1 ring-black/5"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value={option.value}
                                                    checked={isActive}
                                                    onChange={() => {
                                                        setPaymentMethod(
                                                            option.value,
                                                        );
                                                        setGcashError(null);
                                                    }}
                                                    className="w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
                                                />
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                                            isActive
                                                                ? "bg-black text-white"
                                                                : "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-2xl">
                                                            {option.icon}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className={`text-sm font-semibold transition-colors ${
                                                                isActive
                                                                    ? "text-black"
                                                                    : "text-gray-700"
                                                            }`}
                                                        >
                                                            {option.label}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <span className="material-symbols-outlined text-green-600 text-xl">
                                                            check_circle
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* QR PH Section */}
                                {paymentMethod === "gcash" && (
                                    <div className="space-y-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleGcashPay}
                                            disabled={gcashLoading}
                                            className={`w-full py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
                                                gcashLoading
                                                    ? "bg-blue-300 text-white cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                        >
                                            {gcashLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Generating QR Code...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">
                                                        smartphone
                                                    </span>
                                                    Pay ₱{price} with QR PH
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                                            <span className="material-symbols-outlined text-[13px]">
                                                lock
                                            </span>
                                            Secured by PayMongo. Generate your
                                            QR PH code.
                                        </p>

                                        {gcashQrCode && (
                                            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white p-6 space-y-4 mt-4">
                                                <div className="text-center space-y-1">
                                                    <p className="text-base font-bold text-blue-900">
                                                        Scan to Pay
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Amount:{" "}
                                                        <span className="font-bold text-blue-600">
                                                            ₱{price}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                    <img
                                                        src={gcashQrCode}
                                                        alt="QR PH code"
                                                        className="mx-auto h-52 w-52 rounded-lg bg-white p-2 border border-gray-100"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDownloadQr(
                                                                gcashQrCode,
                                                            )
                                                        }
                                                        className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                                                    >
                                                        Download QR
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            window.open(
                                                                gcashQrCode,
                                                                "_blank",
                                                            )
                                                        }
                                                        className="mt-3 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition border"
                                                    >
                                                        Open QR in new tab
                                                    </button>
                                                </div>

                                                <p className="text-center text-xs text-gray-500 leading-relaxed">
                                                    ✓ Scan this QR code with
                                                    your QR PH app. Payment
                                                    confirms automatically.
                                                </p>
                                            </div>
                                        )}

                                        {gcashError && (
                                            <p className="text-xs text-red-500 text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                                                {gcashError}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Cash Section */}
                                {paymentMethod === "cash" && (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 text-sm font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                                            isSubmitting
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-black text-white hover:bg-gray-800 active:scale-[0.98] shadow-sm hover:shadow-md"
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg
                                                    className="animate-spin h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            "Confirm Booking"
                                        )}
                                    </button>
                                )}
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    href="/booking/step-3"
                                    className="text-xs font-medium uppercase tracking-wider text-gray-400 hover:text-black transition-colors duration-200 inline-flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        arrow_back
                                    </span>
                                    Back
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
