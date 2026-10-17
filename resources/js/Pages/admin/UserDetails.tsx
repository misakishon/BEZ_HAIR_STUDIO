import React from "react";
import { Head, Link } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    Scissors,
    Shield,
    UserCheck,
    Users,
    Tag,
    AlertCircle,
    XCircle,
} from "lucide-react";

interface Booking {
    id: number;
    booking_code?: string;
    appointment_date: string;
    appointment_time: string;
    total_price: number | string;
    status: string;
    created_at: string;
    barber_name?: string;
    hairstyle_name?: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: string;
    created_at: string;
}

interface UserDetailsProps {
    user: User;
    bookings: Booking[];
}

export default function UserDetails({ user, bookings = [] }: UserDetailsProps) {
    const initials =
        `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase() ||
        "U";

    const completedCount = bookings.filter(
        (b) => b.status === "completed",
    ).length;

    const totalSpent = bookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                    </span>
                );
            case "confirmed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        <Calendar className="h-3 w-3" />
                        Confirmed
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title={`${user.first_name} ${user.last_name} — Client Profile`} />
            <Sidebar>
                <main className="min-h-screen bg-[#f8f7f4] text-stone-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Navigation back */}
                        <div className="mb-6">
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Client Directory
                            </Link>
                        </div>

                        {/* Client Profile Card */}
                        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 sm:p-8 mb-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                                    <div className="h-20 w-20 rounded-2xl bg-stone-900 text-amber-300 font-bold flex items-center justify-center text-2xl shrink-0 shadow-md border-2 border-stone-100">
                                        {initials}
                                    </div>
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                                                {user.first_name} {user.last_name}
                                            </h1>
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                                                        : "bg-stone-100 text-stone-700 border border-stone-200"
                                                }`}
                                            >
                                                {user.role === "admin" && (
                                                    <Shield className="h-3.5 w-3.5 text-purple-600" />
                                                )}
                                                {user.role}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-stone-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="h-3.5 w-3.5 text-amber-600" />
                                                <span>{user.email}</span>
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-amber-600" />
                                                    <span className="font-mono">{user.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                                                <span>
                                                    Member since{" "}
                                                    {new Date(user.created_at).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Summary KPI Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-stone-100">
                                <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/60">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                        Total Bookings
                                    </div>
                                    <div className="text-xl font-bold text-stone-900 mt-1">
                                        {bookings.length}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                                        Completed Services
                                    </div>
                                    <div className="text-xl font-bold text-emerald-800 mt-1">
                                        {completedCount}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/50">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                                        Total Spend (Completed)
                                    </div>
                                    <div className="text-xl font-bold text-stone-900 mt-1">
                                        ₱{totalSpent.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking History Table */}
                        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                            <div className="p-6 border-b border-stone-100">
                                <h2 className="text-base font-bold text-stone-900">
                                    Appointment & Service History
                                </h2>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Comprehensive log of all haircuts and styling sessions booked by this client.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-100 bg-stone-50/75">
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Booking Code
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Barber
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Service / Cut
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="py-3.5 px-4 font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 text-xs">
                                        {bookings.length > 0 ? (
                                            bookings.map((booking) => (
                                                <tr
                                                    key={booking.id}
                                                    className="hover:bg-amber-50/20 transition-colors"
                                                >
                                                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                                                        {booking.booking_code || `#${booking.id}`}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-stone-700">
                                                        <div className="font-semibold text-stone-900">
                                                            {new Date(booking.appointment_date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </div>
                                                        <div className="text-[11px] text-stone-500">
                                                            {booking.appointment_time}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-medium text-stone-800">
                                                        {booking.barber_name || "Assigned Barber"}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-stone-700">
                                                        {booking.hairstyle_name || "Custom Haircut"}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-stone-900">
                                                        ₱{Number(booking.total_price || 0).toFixed(2)}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {getStatusBadge(booking.status)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-12 text-center text-stone-400"
                                                >
                                                    <Calendar className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                                                    No appointment history found for this client.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </Sidebar>
        </>
    );
}
