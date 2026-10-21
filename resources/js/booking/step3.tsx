import React, { useState, useEffect, useRef } from "react";
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
    hairstyleId: number | null;
    bookingDate: string;
    bookingTime: string;
    displayPrice?: number | string;
}

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

export default function BookingStep3({
    hairstyle,
    barber,
    barberId,
    hairstyleId,
    bookingDate,
    bookingTime,
}: BookingStep4Props) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // OTP States
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [isResendingOTP, setIsResendingOTP] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpSuccess, setOtpSuccess] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Leave Warning Modal States
    const [showLeaveWarning, setShowLeaveWarning] = useState(false);
    const [leaveTarget, setLeaveTarget] = useState<string | null>(null);

    // Phone input ref
    const phoneInputRef = useRef<HTMLInputElement>(null);

    const { props } = usePage<any>();
    const priceValue =
        props && props.displayPrice !== undefined && props.displayPrice !== null
            ? Number(props.displayPrice)
            : hairstyle
              ? Number(hairstyle.price ?? 0)
              : 0;
    const price = priceValue.toFixed(2);
    const serviceName = hairstyle?.name ?? "Service";
    const barberName = barber
        ? barber.full_name
        : barberId === 0
          ? "Any Available"
          : "—";
    const displayDate = formatDate(bookingDate);
    const displayTime = formatTime(bookingTime);
    const imageUrl =
        hairstyle?.image_path ??
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=120&q=80";

    const getCsrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";

    // Check if user has entered any data
    const hasUserData =
        fullName.trim() || email.trim() || phone.trim() || otpSent;

    // Format phone number for display
    const formatPhoneNumber = (value: string): string => {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned) return "";
        let number = cleaned;
        if (number.startsWith("0")) {
            number = number.substring(1);
        }
        if (number.startsWith("63")) {
            number = number.substring(2);
        }
        if (number.length > 10) {
            number = number.substring(0, 10);
        }
        return number;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const digitsOnly = rawValue.replace(/\D/g, "");
        if (!digitsOnly) {
            setPhone("");
            return;
        }
        const formatted = formatPhoneNumber(digitsOnly);
        setPhone(formatted);
    };

    const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const input = e.target;
        setTimeout(() => {
            input.setSelectionRange(input.value.length, input.value.length);
        }, 0);
    };

    // Save data to session storage
    useEffect(() => {
        const saveData = () => {
            const data = {
                fullName,
                email,
                phone,
                notes,
                agreed,
                otpSent,
                timestamp: Date.now(),
            };
            try {
                if (hasUserData) {
                    sessionStorage.setItem(
                        "booking_step4_data",
                        JSON.stringify(data),
                    );
                }
            } catch (e) {
                // Ignore storage errors
            }
        };
        saveData();
    }, [fullName, email, phone, notes, agreed, otpSent, hasUserData]);

    // Load data from session storage on mount
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem("booking_step4_data");
            if (saved) {
                const data = JSON.parse(saved);
                if (
                    data.timestamp &&
                    Date.now() - data.timestamp < 30 * 60 * 1000
                ) {
                    setFullName(data.fullName || "");
                    setEmail(data.email || "");
                    setPhone(data.phone || "");
                    setNotes(data.notes || "");
                    setAgreed(data.agreed || false);
                    setOtpSent(data.otpSent || false);
                } else {
                    sessionStorage.removeItem("booking_step4_data");
                }
            }
        } catch (e) {
            // Ignore parse errors
        }
    }, []);

    // Timer for OTP resend
    useEffect(() => {
        let interval: number | undefined;
        if (otpSent && timer > 0) {
            interval = window.setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [otpSent, timer]);

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            const cameFromStep5 = document.referrer.includes("/booking/step-5");
            if (hasUserData && !cameFromStep5) {
                setShowLeaveWarning(true);
                window.history.pushState(null, "", window.location.href);
            }
        };
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [hasUserData]);

    // Handle beforeunload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUserData) {
                e.preventDefault();
                e.returnValue =
                    "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUserData]);

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!fullName.trim()) e.fullName = "Full name is required.";
        if (!email.trim()) e.email = "Email address is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
        if (!phone.trim()) {
            e.phone = "Phone number is required.";
        } else if (phone.length < 10) {
            e.phone = "Please enter a valid 10-digit phone number.";
        } else if (!/^[0-9]{10}$/.test(phone)) {
            e.phone = "Phone number must contain only digits.";
        }
        if (!agreed) e.agreed = "You must agree to the cancellation policy.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSendOTP = async () => {
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setErrors((prev) => ({
                ...prev,
                email: "Please enter a valid email first.",
            }));
            return;
        }

        setIsSendingOTP(true);
        setOtpError("");
        setOtpSent(false);
        setOtpSuccess(false);
        setCanResend(false);
        setTimer(60);

        try {
            // Use the props from the server (bookingDate and bookingTime)
            const dateToSend =
                bookingDate || sessionStorage.getItem("booking_date") || "";
            const timeToSend =
                bookingTime || sessionStorage.getItem("booking_time") || "";

            // Validate that we have all required data
            if (!dateToSend || !timeToSend) {
                setOtpError(
                    "Missing date or time. Please go back and select a date/time.",
                );
                setIsSendingOTP(false);
                return;
            }

            const payload: Record<string, any> = {
                barber_id: barberId,
                date: dateToSend,
                time: timeToSend,
                full_name: fullName.trim(),
                email: email.trim(),
                phone: `+63${phone}`,
                notes: notes || "",
            };

            if (hairstyleId) {
                payload.hairstyle_id = hairstyleId;
            }

            console.log("Sending payload to /booking/step-3:", payload);

            // First, save booking data and send OTP in one request
            const response = await fetch("/booking/step-3", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (response.status === 422 && data.errors) {
                    const fieldErrors: Record<string, string> = {};
                    Object.entries(data.errors).forEach(([key, value]) => {
                        fieldErrors[key] = Array.isArray(value)
                            ? value[0]
                            : String(value);
                    });
                    setErrors(fieldErrors);
                    setOtpError("Please fix the errors in the form.");
                    console.error("Validation errors:", data.errors);
                    return;
                }

                setOtpError(data.message || "Failed to save booking data.");
                return;
            }

            if (data.success) {
                setOtpSent(true);
                setOtpSuccess(true);
                setShowOTPModal(true);
                setErrors({});
                setTimeout(() => setOtpSuccess(false), 3000);
            } else {
                setOtpError(
                    data.message || "Failed to send OTP. Please try again.",
                );
            }
        } catch (error) {
            console.error("Error:", error);
            setOtpError("Network error. Please try again.");
        } finally {
            setIsSendingOTP(false);
        }
    };

    const handleVerifyOTP = async (code: string) => {
        if (!code || code.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP code.");
            return;
        }

        setIsVerifyingOTP(true);
        setOtpError("");

        try {
            const emailToVerify =
                email || sessionStorage.getItem("booking_email") || "";

            if (!emailToVerify) {
                setOtpError("Email not found. Please try again.");
                return;
            }

            const response = await fetch("/booking/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    email: emailToVerify,
                    otp: code,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setOtpError(data.message || "Invalid OTP. Please try again.");
                return;
            }

            // Success: close modal, mark verified, and navigate to payment step
            setShowOTPModal(false);
            setOtpCode("");
            setOtpError("");
            sessionStorage.setItem("otp_verified", "true");

            router.visit("/booking/step-4");
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setOtpError("Network error. Please try again.");
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;
        setCanResend(false);
        setTimer(60);
        setOtpError("");
        setIsResendingOTP(true);

        try {
            const response = await fetch("/booking/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();

            if (!data.success) {
                setOtpError(data.message || "Failed to resend OTP.");
            }
        } catch (error) {
            console.error("Error resending OTP:", error);
            setOtpError("Network error. Please try again.");
        } finally {
            setIsResendingOTP(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        handleSendOTP();
    };

    const handleOtpChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
    ) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value) {
            const newOtp = otpCode.split("");
            newOtp[index] = value;
            setOtpCode(newOtp.join(""));
            setOtpError("");

            const nextInput = e.target
                .nextElementSibling as HTMLInputElement | null;
            if (nextInput && value) {
                nextInput.focus();
            }
        } else {
            const newOtp = otpCode.split("");
            newOtp[index] = "";
            setOtpCode(newOtp.join(""));
        }
    };

    const handleOtpKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        const target = e.target as HTMLInputElement;
        if (e.key === "Backspace" && !target.value && index > 0) {
            const prevInput =
                target.previousElementSibling as HTMLInputElement | null;
            if (prevInput) {
                prevInput.focus();
            }
        }
        if (e.key === "Enter" && otpCode.length === 6) {
            handleVerifyOTP(otpCode);
        }
    };

    const handleLeave = (e: React.MouseEvent, href: string) => {
        if (hasUserData) {
            e.preventDefault();
            setLeaveTarget(href);
            setShowLeaveWarning(true);
        }
    };

    const confirmLeave = () => {
        if (leaveTarget) {
            sessionStorage.removeItem("booking_step4_data");
            sessionStorage.removeItem("otp_verified");
            setFullName("");
            setEmail("");
            setPhone("");
            setNotes("");
            setAgreed(false);
            setOtpSent(false);
            setOtpCode("");
            setShowOTPModal(false);
            setShowLeaveWarning(false);
            router.visit(leaveTarget);
        }
    };

    return (
        <>
            <Head title="Contact Information — BEZ Hair Studio" />
            <Header />

            <main className="min-h-screen bg-[#faf9f6] pb-12">
                <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
                    <StepIndicator currentStep={3} />

                    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
                        {/* Booking Summary */}
                        <div>
                            <h2 className="mb-3 text-sm font-semibold text-neutral-950">
                                Booking Summary
                            </h2>

                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                                <div className="flex items-center gap-4 border-b border-neutral-100 p-5">
                                    <img
                                        src={imageUrl}
                                        alt={serviceName}
                                        className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            (
                                                e.currentTarget as HTMLImageElement
                                            ).src =
                                                "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=120&q=80";
                                        }}
                                    />
                                    <div>
                                        <p className="text-base font-semibold text-neutral-950">
                                            {serviceName}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {hairstyle?.duration_minutes ??
                                                "--"}{" "}
                                            min · ₱{price}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 p-5">
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

                                    <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-200">
                                        <span className="text-sm font-semibold text-neutral-900">
                                            Total
                                        </span>
                                        <span className="text-2xl font-semibold text-neutral-950">
                                            ₱{price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="mb-3 text-sm font-semibold text-neutral-950">
                                Your Information
                            </h2>

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                                className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
                            >
                                <div>
                                    <label htmlFor="booking-full-name" className="mb-1.5 block text-sm font-medium text-neutral-800">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="booking-full-name"
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        placeholder="Enter your full name"
                                        className={`w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                                            errors.fullName
                                                ? "border-red-500"
                                                : "border-neutral-300"
                                        }`}
                                    />
                                    {errors.fullName && (
                                        <p role="alert" className="mt-1 text-xs text-red-600">
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="booking-email" className="mb-1.5 block text-sm font-medium text-neutral-800">
                                        Email Address *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            id="booking-email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="your@email.com"
                                            disabled={otpSent}
                                            className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                                                errors.email
                                                    ? "border-red-500"
                                                    : "border-neutral-300"
                                            } ${otpSent ? "cursor-not-allowed bg-neutral-100 text-neutral-500" : ""}`}
                                        />
                                    </div>
                                    {otpSuccess && (
                                        <p role="status" className="mt-1 text-xs text-emerald-700">
                                            OTP sent successfully! Check your
                                            email.
                                        </p>
                                    )}
                                    {errors.email && (
                                        <p role="alert" className="mt-1 text-xs text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="booking-phone" className="mb-1.5 block text-sm font-medium text-neutral-800">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <span className="text-gray-500 text-sm font-medium">
                                                +63
                                            </span>
                                        </div>
                                        <input
                                            ref={phoneInputRef}
                                            type="tel"
                                            id="booking-phone"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            onFocus={handlePhoneFocus}
                                            placeholder="912 345 6789"
                                            className={`w-full rounded-xl border py-3 pl-12 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                                                errors.phone
                                                    ? "border-red-500"
                                                    : "border-neutral-300"
                                            }`}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Enter 10-digit phone number (e.g., 912
                                        345 6789)
                                    </p>
                                    {errors.phone && (
                                        <p role="alert" className="mt-1 text-xs text-red-600">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="booking-notes" className="mb-1.5 block text-sm font-medium text-neutral-800">
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        id="booking-notes"
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        placeholder="Any preferences or notes for your barber…"
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="agree"
                                        checked={agreed}
                                        onChange={(e) =>
                                            setAgreed(e.target.checked)
                                        }
                                        className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-amber-600 focus:ring-amber-600"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <label
                                                htmlFor="agree"
                                                className="cursor-pointer text-sm text-neutral-700"
                                            >
                                                I agree to the
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPolicyModal(true)}
                                                className="cursor-pointer text-sm font-semibold text-neutral-950 underline underline-offset-2 hover:text-amber-600 transition-colors"
                                            >
                                                cancellation policy
                                            </button>
                                        </div>
                                        {errors.agreed && (
                                            <p role="alert" className="mt-1 text-xs text-red-600">
                                                {errors.agreed}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        isSendingOTP ||
                                        isVerifyingOTP
                                    }
                                    className={`w-full rounded-full py-3.5 text-sm font-semibold transition-colors ${
                                        isSubmitting ||
                                        isSendingOTP ||
                                        isVerifyingOTP
                                            ? "cursor-not-allowed bg-neutral-400 text-white"
                                            : "bg-neutral-950 text-white hover:bg-neutral-800"
                                    }`}
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : isSendingOTP
                                          ? "Sending OTP..."
                                          : "Continue to Payment"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/booking/step-2"
                            onClick={(e) => handleLeave(e, "/booking/step-2")}
                            className="rounded-full px-4 py-3 text-sm text-neutral-600 transition-colors hover:bg-white hover:text-neutral-950"
                        >
                            ← Back
                        </Link>
                    </div>
                </div>
            </main>

            {/* OTP Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl relative">
                        <button
                            onClick={() => {
                                setShowOTPModal(false);
                                setOtpCode("");
                                setOtpError("");
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-amber-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Verification Code
                            </h3>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                We've sent a verification code to{" "}
                                <strong className="text-gray-700">
                                    {email ||
                                        sessionStorage.getItem(
                                            "booking_email",
                                        ) ||
                                        "your email"}
                                </strong>
                                . Please enter the 6-digit code below to verify
                                your email address.
                            </p>

                            <div className="mt-6">
                                <div className="flex gap-3 justify-center">
                                    {[...Array(6)].map((_, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength={1}
                                            value={otpCode[index] || ""}
                                            onChange={(e) =>
                                                handleOtpChange(e, index)
                                            }
                                            onKeyDown={(e) =>
                                                handleOtpKeyDown(e, index)
                                            }
                                            className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                {otpError && (
                                    <p className="text-sm text-red-500 mt-3">
                                        {otpError}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handleResendOTP}
                                    disabled={!canResend || isResendingOTP}
                                    className={`text-sm font-medium ${
                                        canResend && !isResendingOTP
                                            ? "text-black hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {isResendingOTP
                                        ? "Sending..."
                                        : canResend
                                          ? "Resend Code"
                                          : `Resend in ${timer}s`}
                                </button>
                            </div>

                            <button
                                onClick={() => handleVerifyOTP(otpCode)}
                                disabled={
                                    isVerifyingOTP || otpCode.length !== 6
                                }
                                className={`w-full mt-6 py-3 rounded-lg font-medium transition ${
                                    isVerifyingOTP || otpCode.length !== 6
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-black text-white hover:bg-gray-800"
                                }`}
                            >
                                {isVerifyingOTP
                                    ? "Verifying..."
                                    : "Verify Code"}
                            </button>

                            <button
                                onClick={() => {
                                    setShowOTPModal(false);
                                    setOtpCode("");
                                    setOtpError("");
                                    setOtpSent(false);
                                    setEmail("");
                                    setTimer(60);
                                    setCanResend(false);
                                }}
                                className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition"
                            >
                                ← Change Email Address
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Warning Modal */}
            {showLeaveWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-amber-600">
                                    warning
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Are you sure?
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                If you go back, your entered information will be
                                cleared and you'll need to start over.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowLeaveWarning(false);
                                        setLeaveTarget(null);
                                    }}
                                    className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                                >
                                    Stay Here
                                </button>
                                <button
                                    onClick={confirmLeave}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                                >
                                    Yes, Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Cancellation Policy Modal */}
            {showPolicyModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowPolicyModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Cancellation & Rescheduling Policy
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        BEZ Hair Studio Terms
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPolicyModal(false)}
                                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition"
                                aria-label="Close modal"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="overflow-y-auto py-4 space-y-4 text-sm text-gray-600 leading-relaxed pr-1">
                            <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200/60">
                                <p className="text-xs font-medium text-amber-900 leading-relaxed">
                                    We value your time as well as our barbers'. By booking an appointment with BEZ Hair Studio, you acknowledge and agree to our appointment policy below.
                                </p>
                            </div>

                            <div className="space-y-3.5">
                                <div className="rounded-xl border border-gray-100 p-3.5 bg-gray-50/50">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        1. Advance Notice
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1 pl-4 leading-relaxed">
                                        If you need to reschedule or cancel your appointment, please notify us at least <strong>24 hours in advance</strong> (or as early as possible for same-day bookings). This allows us to offer the slot to clients on our waiting list.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 p-3.5 bg-gray-50/50">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        2. Late Arrivals & Grace Period
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1 pl-4 leading-relaxed">
                                        We provide a <strong>15-minute grace period</strong>. If you arrive more than 15 minutes past your scheduled appointment time, your service may need to be adjusted or rescheduled to avoid delaying subsequent clients.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 p-3.5 bg-gray-50/50">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        3. No-Shows
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1 pl-4 leading-relaxed">
                                        Clients who miss an appointment without any prior contact will be recorded as a no-show. Repeated no-shows may be restricted to walk-in service only.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 p-3.5 bg-gray-50/50">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        4. Online Payments (GCash QR PH)
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1 pl-4 leading-relaxed">
                                        Appointments cancelled with timely notice can be converted to studio credit or rescheduled to an alternate date and time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setAgreed(true);
                                    setErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.agreed;
                                        return newErrors;
                                    });
                                    setShowPolicyModal(false);
                                }}
                                className="flex-1 py-3 px-4 bg-neutral-950 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition shadow-sm"
                            >
                                I Understand & Agree
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPolicyModal(false)}
                                className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
