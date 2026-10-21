import React, { useState, useEffect, useRef, FormEventHandler } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import {
    Loader2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Scissors,
    KeyRound,
    CheckCircle2,
    ArrowLeft,
    RefreshCw,
    X,
} from "lucide-react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [loginNotice, setLoginNotice] = useState<string | null>(null);

    // Main login form
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    // Forgot password modal state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState<"email" | "otp_and_reset">("email");
    const [forgotEmail, setForgotEmail] = useState("");
    const [otpDigits, setOtpDigits] = useState<string[]>(new Array(6).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [forgotError, setForgotError] = useState("");
    const [forgotSuccess, setForgotSuccess] = useState("");
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const getCsrfToken = () => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || ""
        );
    };

    // Auto-open modal if url has ?forgot=1
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("forgot") === "1") {
                setForgotEmail(data.email || "bezcutsfades@gmail.com");
                setShowForgotModal(true);
            }
        }
    }, []);

    // Resend countdown timer
    useEffect(() => {
        let interval: any;
        if (forgotStep === "otp_and_reset" && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [forgotStep, resendTimer]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("admin.login.post"), {
            onFinish: () => reset("password"),
        });
    };

    const handleOpenForgotModal = () => {
        setForgotEmail(data.email || "bezcutsfades@gmail.com");
        setForgotStep("email");
        setForgotError("");
        setForgotSuccess("");
        setOtpDigits(new Array(6).fill(""));
        setNewPassword("");
        setConfirmPassword("");
        setShowForgotModal(true);
    };

    const handleSendForgotOtp = async (targetEmail?: string) => {
        const emailToSend = (
            targetEmail ||
            forgotEmail ||
            data.email ||
            ""
        ).trim();

        if (!emailToSend || !/\S+@\S+\.\S+/.test(emailToSend)) {
            setForgotError("Please enter a valid email address.");
            return;
        }

        setIsSendingOtp(true);
        setForgotError("");
        setForgotSuccess("");

        try {
            const response = await fetch("/admin/forgot-password/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({ email: emailToSend }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setForgotError(
                    result.message ||
                        "Failed to send verification code. Please check the email and try again."
                );
                return;
            }

            setForgotEmail(emailToSend);
            setForgotSuccess(result.message);
            setForgotStep("otp_and_reset");
            setResendTimer(60);
            setCanResend(false);
            setOtpDigits(new Array(6).fill(""));
            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (err) {
            setForgotError("Network error. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;

        const updated = [...otpDigits];
        updated[index] = value;
        setOtpDigits(updated);

        if (value !== "" && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotError("");

        const combinedOtp = otpDigits.join("");
        if (combinedOtp.length !== 6) {
            setForgotError("Please enter the complete 6-digit OTP code.");
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            setForgotError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setForgotError("Passwords do not match.");
            return;
        }

        setIsResetting(true);

        try {
            const response = await fetch("/admin/forgot-password/reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    email: forgotEmail,
                    otp: combinedOtp,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setForgotError(
                    result.message || "Failed to reset password. Please try again."
                );
                return;
            }

            // Success: close modal and notify user
            setShowForgotModal(false);
            setLoginNotice(
                "Password reset successfully! Please sign in with your new password."
            );
            setData("email", forgotEmail);
            setData("password", "");
        } catch (err) {
            setForgotError("Network error. Please try again.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Log In - BEZ Hair Studio" />

            {/* Header Branding */}
            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
                    <Scissors className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Welcome Back
                </h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    BEZ Hair Studio
                </p>
            </div>

            {/* Status / Success Messages */}
            {loginNotice && (
                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{loginNotice}</span>
                </div>
            )}

            {status && !loginNotice && (
                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Email Field */}
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email Address"
                        className="text-xs font-semibold uppercase tracking-wider text-neutral-700"
                    />

                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                            <Mail className="h-4 w-4" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-lg border-neutral-200 pl-10 pr-4 text-sm focus:border-black focus:ring-black"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="bezcutsfades@gmail.com"
                            onChange={(e) => setData("email", e.target.value)}
                        />
                    </div>

                    <InputError
                        message={errors.email}
                        className="mt-1.5 text-xs text-red-500"
                    />
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-xs font-semibold uppercase tracking-wider text-neutral-700"
                        />
                        <button
                            type="button"
                            onClick={handleOpenForgotModal}
                            className="text-xs font-medium text-neutral-500 underline hover:text-black focus:outline-none transition-colors cursor-pointer"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                            <Lock className="h-4 w-4" />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="block w-full rounded-lg border-neutral-200 pl-10 pr-10 text-sm focus:border-black focus:ring-black"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password}
                        className="mt-1.5 text-xs text-red-500"
                    />
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                            className="rounded border-neutral-300 text-black focus:ring-black"
                        />
                        <span className="ms-2 text-xs font-medium text-neutral-600">
                            Remember me
                        </span>
                    </label>
                </div>

                {/* Submit Button with Loading Indicator */}
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md transition duration-150 ease-in-out hover:bg-neutral-800 active:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-75"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Log In"
                    )}
                </button>
            </form>

            {/* Forgot Password OTP Modal */}
            {showForgotModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowForgotModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100 transition"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="text-center mb-5">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                <KeyRound className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">
                                Reset Admin Password
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                                {forgotStep === "email"
                                    ? "Enter your admin Gmail address. We will send a 6-digit verification code to reset your password."
                                    : `Enter the 6-digit OTP code sent to ${forgotEmail} and choose a new password.`}
                            </p>
                        </div>

                        {/* Error Message Alert */}
                        {forgotError && (
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                                {forgotError}
                            </div>
                        )}

                        {/* Success Message Alert */}
                        {forgotSuccess && forgotStep === "otp_and_reset" && (
                            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>{forgotSuccess}</span>
                            </div>
                        )}

                        {/* STEP 1: Enter Email to Send OTP */}
                        {forgotStep === "email" ? (
                            <div className="space-y-4">
                                <div>
                                    <InputLabel
                                        htmlFor="forgot-email"
                                        value="Admin Gmail Address"
                                        className="text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                    />
                                    <div className="relative mt-1.5">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <TextInput
                                            id="forgot-email"
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) =>
                                                setForgotEmail(e.target.value)
                                            }
                                            placeholder="bezcutsfades@gmail.com"
                                            className="block w-full rounded-lg border-neutral-200 pl-10 pr-4 text-sm focus:border-black focus:ring-black"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleSendForgotOtp()}
                                    disabled={isSendingOtp}
                                    className="w-full flex items-center justify-center rounded-lg bg-black px-4 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-neutral-800 transition disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {isSendingOtp ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending Code...
                                        </>
                                    ) : (
                                        "Send OTP to Gmail"
                                    )}
                                </button>
                            </div>
                        ) : (
                            /* STEP 2: Enter OTP + New Password */
                            <form
                                onSubmit={handleResetPassword}
                                className="space-y-4"
                            >
                                {/* 6-Digit OTP Boxes */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2 text-center">
                                        Verification Code
                                    </label>
                                    <div className="flex gap-2 justify-center">
                                        {otpDigits.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) =>
                                                    (otpInputRefs.current[index] =
                                                        el)
                                                }
                                                type="text"
                                                maxLength={1}
                                                inputMode="numeric"
                                                value={digit}
                                                onChange={(e) =>
                                                    handleOtpChange(
                                                        e.target.value,
                                                        index
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleOtpKeyDown(e, index)
                                                }
                                                className="w-11 h-13 text-center text-xl font-bold bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* New Password Field */}
                                <div>
                                    <InputLabel
                                        htmlFor="new-password"
                                        value="New Password"
                                        className="text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                    />
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <TextInput
                                            id="new-password"
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            placeholder="Minimum 8 characters"
                                            className="block w-full rounded-lg border-neutral-200 pl-10 pr-10 text-sm focus:border-black focus:ring-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    !showNewPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <InputLabel
                                        htmlFor="confirm-password"
                                        value="Confirm New Password"
                                        className="text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                    />
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <TextInput
                                            id="confirm-password"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Repeat new password"
                                            className="block w-full rounded-lg border-neutral-200 pl-10 pr-10 text-sm focus:border-black focus:ring-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Resend Code Row */}
                                <div className="flex items-center justify-between pt-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSendForgotOtp(forgotEmail)
                                        }
                                        disabled={!canResend || isSendingOtp}
                                        className={`text-xs font-medium flex items-center gap-1 ${
                                            canResend && !isSendingOtp
                                                ? "text-neutral-900 hover:underline cursor-pointer"
                                                : "text-neutral-400 cursor-not-allowed"
                                        }`}
                                    >
                                        <RefreshCw
                                            className={`h-3 w-3 ${
                                                isSendingOtp
                                                    ? "animate-spin"
                                                    : ""
                                            }`}
                                        />
                                        <span>
                                            {isSendingOtp
                                                ? "Sending..."
                                                : canResend
                                                  ? "Resend Code"
                                                  : `Resend code in ${resendTimer}s`}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForgotStep("email");
                                            setForgotError("");
                                            setForgotSuccess("");
                                        }}
                                        className="text-xs text-neutral-500 hover:text-neutral-800 transition flex items-center gap-1"
                                    >
                                        <ArrowLeft className="h-3 w-3" />
                                        <span>Change Email</span>
                                    </button>
                                </div>

                                {/* Submit Reset Button */}
                                <button
                                    type="submit"
                                    disabled={isResetting}
                                    className="w-full mt-2 flex items-center justify-center rounded-lg bg-black px-4 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-neutral-800 transition disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {isResetting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating Password...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
