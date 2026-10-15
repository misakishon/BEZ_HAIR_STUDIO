import React, { useState, FormEventHandler } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2, Mail, Lock, Eye, EyeOff, Scissors } from "lucide-react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("admin.login.post"), {
            onFinish: () => reset("password"),
        });
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

            {/* Status Message */}
            {status && (
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
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-xs text-neutral-500 underline hover:text-black focus:outline-none"
                            >
                                Forgot password?
                            </Link>
                        )}
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
        </GuestLayout>
    );
}
