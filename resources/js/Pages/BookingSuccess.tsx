import React from "react";
import { Head, Link } from "@inertiajs/react";
import Header from "../components/header";

interface Booking {
    id: number;
    confirmation_number: string;
    full_name: string;
    email: string;
    phone: string;
    booking_date: string;
    booking_time: string;
    total_price: number | string;
    payment_method: string;
    hairstyle_name: string;
    barber_name: string | null;
    status: string;
}

interface BookingSuccessProps {
    booking: Booking;
}

const formatDate = (dateStr: string): string => {
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
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const PAYMENT_LABELS: Record<string, string> = {
    cash: "Cash",
    gcash: "GCash",
    card: "Credit / Debit Card",
};

export default function BookingSuccess({ booking }: BookingSuccessProps) {
    const displayDate = formatDate(booking.booking_date);
    const displayTime = formatTime(booking.booking_time);
    const paymentLabel =
        PAYMENT_LABELS[booking.payment_method] ?? booking.payment_method;

    return (
        <>
            <Head title="Booking Confirmed — BEZ Hair Studio" />
            <Header />

            <main className="min-h-screen bg-[#faf9f6] pb-12">
                <div className="mx-auto max-w-3xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
                    {/* Success Icon */}
                    <div className="mb-8 text-center">
                        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                            <svg
                                className="h-8 w-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h1 className="mb-3 font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
                            Booking Confirmed!
                        </h1>
                        <p className="text-base text-neutral-600 sm:text-lg">
                            Your appointment has been successfully booked.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                            Our admin will send you the{" "}
                            <strong>service ticket</strong> within 30 minutes to{" "}
                            <strong>{booking.email}</strong>
                        </p>
                    </div>

                    {/* Confirmation Details */}
                    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
                        <div className="mb-6 border-b border-neutral-200 pb-6 text-center">
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                                Confirmation Number
                            </p>
                            <p className="font-mono text-2xl font-semibold tracking-wide text-neutral-950">
                                {booking.confirmation_number ||
                                    `BZ${String(booking.id).padStart(6, "0")}`}
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Service Details */}
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                                    Service Details
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <p className="mb-1 text-xs text-neutral-500">
                                            Service
                                        </p>
                                        <p className="font-medium text-neutral-950">
                                            {booking.hairstyle_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-neutral-500">
                                            Barber
                                        </p>
                                        <p className="font-medium text-neutral-950">
                                            {booking.barber_name ||
                                                "Any Available"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                                    Date & Time
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                            Date
                                        </p>
                                        <p className="text-gray-900 font-medium">
                                            {displayDate}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                            Time
                                        </p>
                                        <p className="text-gray-900 font-medium">
                                            {displayTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3">
                                Your Information
                            </p>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <p className="mb-1 text-xs text-neutral-500">
                                        Name
                                    </p>
                                    <p className="break-words font-medium text-neutral-950">
                                        {booking.full_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-neutral-500">
                                        Email
                                    </p>
                                    <p className="break-words font-medium text-neutral-950">
                                        {booking.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-neutral-500">
                                        Phone
                                    </p>
                                    <p className="font-medium text-neutral-950">
                                        {booking.phone}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-neutral-500">
                                        Payment Method
                                    </p>
                                    <p className="font-medium text-neutral-950">
                                        {paymentLabel}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Price */}
                        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                                Total Amount
                            </p>
                            <p className="text-2xl font-semibold text-neutral-950">
                                ₱{Number(booking.total_price ?? 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* What's Next Section */}
                    <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
                            What's Next?
                        </p>
                        <ul className="space-y-3 text-sm leading-6 text-neutral-700">
                            <li className="flex items-start gap-3">
                                <span className="mt-0.5 font-semibold text-amber-800">
                                    1.
                                </span>
                                <span>
                                    A confirmation email has been sent to{" "}
                                    <strong>{booking.email}</strong>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-0.5 font-semibold text-amber-800">
                                    2.
                                </span>
                                <span>
                                    Our admin will review your booking and send
                                    you a{" "}
                                    <strong>
                                        service ticket within 30 minutes
                                    </strong>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-0.5 font-semibold text-amber-800">
                                    3.
                                </span>
                                <span>
                                    Please arrive{" "}
                                    <strong>10-15 minutes before</strong> your
                                    appointment time
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-0.5 font-semibold text-amber-800">
                                    4.
                                </span>
                                <span>
                                    If you need to reschedule, contact us at
                                    least <strong>24 hours in advance</strong>
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                        >
                            Return to Home
                        </Link>
                        <Link
                            href="/booking/step-1"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
                        >
                            Book Another Appointment
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
