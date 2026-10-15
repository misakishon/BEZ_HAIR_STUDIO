import React, { useState, useRef, useEffect } from "react";

interface EmailVerificationProps {
    email?: string;
    onVerify?: (code: string) => void;
    onResend?: () => void;
    error?: string;
    isVerifying?: boolean;
    isResending?: boolean;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
    email = "your email",
    onVerify,
    onResend,
    error = "",
    isVerifying = false,
    isResending = false,
}) => {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [countdown, setCountdown] = useState<number>(30);
    const [canResend, setCanResend] = useState<boolean>(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer logic for the Resend cooldown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Clear the boxes and refocus the first one whenever a new error comes in
    // (e.g. "Invalid OTP") so the user can immediately retype.
    useEffect(() => {
        if (error) {
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        }
    }, [error]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        const value = element.value;
        if (isNaN(Number(value))) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input field
        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Trigger verification automatically once all boxes are filled
        const combinedCode = newOtp.join("");
        if (combinedCode.length === 6 && onVerify) {
            onVerify(combinedCode);
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        // Move to previous field on Backspace if current field is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendClick = () => {
        if (!canResend) return;
        setOtp(new Array(6).fill(""));
        setCountdown(30);
        setCanResend(false);
        inputRefs.current[0]?.focus();
        if (onResend) onResend();
    };

    return (
        <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Verification Icon Vector Graphic */}
            <div className="w-32 h-32 mb-6 flex items-center justify-center text-neutral-300">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                    <circle
                        cx="18"
                        cy="14"
                        r="4"
                        className="stroke-neutral-400 fill-white"
                        strokeWidth="1.5"
                    />
                    <polyline
                        points="16,14 17.5,15.5 20,12.5"
                        className="stroke-sky-500"
                        strokeWidth="2"
                    />
                    <line x1="2" y1="2" x2="6" y2="2" strokeWidth="2" />
                    <line x1="2" y1="5" x2="4" y2="5" strokeWidth="2" />
                </svg>
            </div>

            {/* 6-Digit Code Inputs */}
            <div className="flex gap-2 sm:gap-3 justify-center mb-3 w-full">
                {otp.map((data, index) => (
                    <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={data}
                        disabled={isVerifying}
                        ref={(el) => (inputRefs.current[index] = el)}
                        onChange={(e) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-10 h-14 sm:w-12 sm:h-16 text-center text-xl font-semibold bg-neutral-100 text-neutral-800 border-0 rounded-xl focus:bg-white focus:ring-2 outline-none transition-all disabled:opacity-50 ${
                            error
                                ? "ring-2 ring-red-400 focus:ring-red-400"
                                : "focus:ring-sky-400"
                        }`}
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            {/* Status row: verifying spinner OR error message. Reserved height
                so the layout doesn't jump when one appears/disappears. */}
            <div className="min-h-[20px] mb-5 flex items-center justify-center">
                {isVerifying ? (
                    <span className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                        <svg
                            className="w-4 h-4 animate-spin text-sky-500"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Verifying…
                    </span>
                ) : error ? (
                    <p className="text-xs sm:text-sm font-medium text-red-500">
                        {error}
                    </p>
                ) : null}
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Verification Code
            </h2>

            {/* Description Text Container */}
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mb-8">
                We sent a secure verification pass code to{" "}
                <span className="font-medium text-neutral-600">{email}</span>.
                Please enter the 6 digits above to seamlessly finalize your
                guest booking process.
            </p>

            {/* Action Button styled identically to image_203d8a.png */}
            <button
                onClick={handleResendClick}
                disabled={!canResend || isResending}
                className={`w-full max-w-xs py-3.5 px-6 font-semibold text-white rounded-xl shadow-md transition-all ${
                    canResend && !isResending
                        ? "bg-sky-400 hover:bg-sky-500 active:scale-[0.99] cursor-pointer"
                        : "bg-sky-300 opacity-70 cursor-not-allowed"
                }`}
            >
                {isResending
                    ? "Resending…"
                    : canResend
                      ? "Resend"
                      : `Resend in ${countdown}s`}
            </button>
        </div>
    );
};

export default EmailVerification;
