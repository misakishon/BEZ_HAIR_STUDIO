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

            <main className="min-h-screen bg-white pb-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-20">
                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
                            <svg
                                className="w-10 h-10 text-green-600"
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
                        <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">
                            Booking Confirmed!
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Your appointment has been successfully booked.
                        </p>
                        <p className="text-gray-600 text-base mt-2">
                            Our admin will send you the{" "}
                            <strong>service ticket</strong> within 30 minutes to{" "}
                            <strong>{booking.email}</strong>
                        </p>
                    </div>

                    {/* Confirmation Details */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-8">
                        <div className="text-center mb-6 pb-6 border-b border-gray-200">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-2">
                                Confirmation Number
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {booking.confirmation_number ||
                                    `BZ${String(booking.id).padStart(6, "0")}`}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Service Details */}
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3">
                                    Service Details
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                            Service
                                        </p>
                                        <p className="text-gray-900 font-medium">
                                            {booking.hairstyle_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                            Barber
                                        </p>
                                        <p className="text-gray-900 font-medium">
                                            {booking.barber_name ||
                                                "Any Available"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3">
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
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                        Name
                                    </p>
                                    <p className="text-gray-900 font-medium">
                                        {booking.full_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                        Email
                                    </p>
                                    <p className="text-gray-900 font-medium">
                                        {booking.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                        Phone
                                    </p>
                                    <p className="text-gray-900 font-medium">
                                        {booking.phone}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                        Payment Method
                                    </p>
                                    <p className="text-gray-900 font-medium">
                                        {paymentLabel}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Price */}
                        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
                                Total Amount
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                ₱{Number(booking.total_price ?? 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* What's Next Section */}
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-8">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-semibold mb-3">
                            What's Next?
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 font-bold mt-0.5">
                                    1.
                                </span>
                                <span>
                                    A confirmation email has been sent to{" "}
                                    <strong>{booking.email}</strong>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 font-bold mt-0.5">
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
                                <span className="text-blue-600 font-bold mt-0.5">
                                    3.
                                </span>
                                <span>
                                    Please arrive{" "}
                                    <strong>10-15 minutes before</strong> your
                                    appointment time
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 font-bold mt-0.5">
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
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-gray-800 transition"
                        >
                            Return to Home
                        </Link>
                        <Link
                            href="/booking/step-1"
                            className="inline-flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-900 text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-gray-300 transition"
                        >
                            Book Another Appointment
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
