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

            <main className="min-h-screen bg-[#faf9f6] pb-12">
                <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
                    <StepIndicator currentStep={4} />

                    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
                        {/* Booking Summary */}
                        <div>
                            <h2 className="mb-3 text-sm font-semibold text-neutral-950">
                                Booking Summary
                            </h2>

                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                                <div className="flex items-center gap-4 border-b border-neutral-100 p-5">
                                    <div>
                                        <p className="font-semibold text-neutral-950">
                                            {hairstyle?.name ?? "Selected service"}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {hairstyle?.duration_minutes ??
                                                "--"}{" "}
                                            min ·{" "}
                                            <span className="font-medium text-neutral-900">
                                                ₱{price}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 p-5">
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
                                            className="flex items-center justify-between gap-4 border-b border-neutral-100 py-3 last:border-0"
                                        >
                                            <span className="text-xs text-neutral-500">
                                                {label}
                                            </span>
                                            <span className="text-right text-sm font-medium text-neutral-900">
                                                {value}
                                            </span>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-200">
                                        <span className="text-sm font-semibold text-neutral-900">
                                            Total
                                        </span>
                                        <span className="text-2xl font-semibold tracking-tight text-neutral-950">
                                            ₱{price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div>
                            <h2 className="mb-3 text-sm font-semibold text-neutral-950">
                                Choose Payment
                            </h2>

                            <form
                                onSubmit={handleSubmitCash}
                                className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
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
                                                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
                                                    isActive
                                                        ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-100"
                                                        : "border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
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
                                                    className="h-4 w-4 flex-shrink-0 cursor-pointer accent-amber-600"
                                                />
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                                            isActive
                                                                ? "bg-neutral-950 text-white"
                                                                : "bg-neutral-100 text-neutral-600"
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
                                                                    ? "text-neutral-950"
                                                                    : "text-neutral-700"
                                                            }`}
                                                        >
                                                            {option.label}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-neutral-500">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <span className="material-symbols-outlined text-emerald-700 text-xl">
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
                                                    ? "cursor-not-allowed bg-neutral-400 text-white"
                                                    : "bg-neutral-950 text-white hover:bg-neutral-800"
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

                                        <p className="flex items-center justify-center gap-1 text-center text-xs text-neutral-500">
                                            <span className="material-symbols-outlined text-[13px]">
                                                lock
                                            </span>
                                            Secured by PayMongo. Generate your
                                            QR PH code.
                                        </p>

                                        {gcashQrCode && (
                                            <div className="mt-4 space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6">
                                                <div className="text-center space-y-1">
                                                    <p className="text-base font-semibold text-neutral-950">
                                                        Scan to Pay
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Amount:{" "}
                                                        <span className="font-semibold text-neutral-950">
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
                                                        className="mt-3 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
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
                                                        className="mt-3 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
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
                                            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
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
                                                : "bg-neutral-950 text-white hover:bg-neutral-800 active:scale-[0.98] shadow-sm hover:shadow-md"
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
                                    className="inline-flex items-center gap-1 rounded-full px-4 py-3 text-sm text-neutral-600 transition-colors hover:bg-white hover:text-neutral-950"
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
