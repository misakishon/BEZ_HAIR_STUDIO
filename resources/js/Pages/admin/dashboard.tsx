import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, Link } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import RevenueTrendCard, { MonthlyData } from "../components/RevenueTrendCard";
import AdminToast, { ToastMessage } from "../../components/AdminToast";
import {
    CalendarCheck2,
    Banknote,
    Users,
    Scissors,
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    Clock,
    Lock,
    Check,
    Calendar,
    ArrowUpRight,
    Sparkles,
} from "lucide-react";

interface DashboardProps {
    totalBookings?: number;
    totalRevenue?: number;
    totalCustomers?: number;
    totalBarbers?: number;
    topBarbers?: Array<{ full_name: string; appointment_count: number }>;
    recentAppointments?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        barber_name: string;
        hairstyle_name: string;
        appointment_date: string;
        appointment_time: string;
        status: string;
        total_price: number;
        booking_full_name?: string;
        booking_email?: string;
    }>;
    monthlyData?: Record<number, { bookings: number; revenue: number }>;
    revenueByCategory?: Record<string, number>;
    bookingsByDay?: Record<string, number>;
    revenueChange?: number;
    bookingsChange?: number;
    customersChange?: number;
    avgChange?: number;
    currentMonthRevenue?: number;
    avgPerVisit?: number;
    liveActivity?: Array<{
        message: string;
        timeAgo: string;
        color: string;
        status: string;
    }>;
}

interface TimeSlot {
    id: number;
    barber_id: number;
    slot_date: string;
    slot_time: string;
    is_available: boolean;
    max_bookings: number;
    current_bookings: number;
}

const ALL_TIME_SLOTS = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
];

const MONTHS = [
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function formatPeso(value: number): string {
    return `₱${Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: 0,
    })}`;
}

export default function Dashboard({
    totalBookings = 0,
    totalRevenue = 0,
    totalCustomers = 0,
    totalBarbers = 0,
    topBarbers = [],
    recentAppointments = [],
    monthlyData = {},
    bookingsByDay = {},
    revenueChange = 0,
    bookingsChange = 0,
    customersChange = 0,
    avgChange = 0,
    currentMonthRevenue = 0,
    avgPerVisit = 0,
    liveActivity = [],
}: DashboardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBarber, setSelectedBarber] = useState<number>(0);
    const [showAddSlot, setShowAddSlot] = useState(false);
    const [newSlotTime, setNewSlotTime] = useState("09:00");
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);

    // Derived chart monthly data
    const chartMonthlyData: MonthlyData[] = useMemo(() => {
        return MONTH_NAMES_SHORT.map((month, idx) => {
            const mKey = idx + 1;
            const item = monthlyData[mKey] ?? Object.values(monthlyData)[idx];
            return {
                month,
                revenue: Number(item?.revenue ?? 0),
                bookings: Number(item?.bookings ?? 0),
            };
        });
    }, [monthlyData]);

    const bookingsByDayData = useMemo(
        () => Object.values(bookingsByDay).map((v) => Number(v ?? 0)),
        [bookingsByDay],
    );
    const maxDayBookings = useMemo(
        () => Math.max(...bookingsByDayData, 1),
        [bookingsByDayData],
    );
    const totalAppointments = useMemo(
        () =>
            topBarbers.reduce(
                (sum, b) => sum + (b?.appointment_count || 0),
                0,
            ) || 1,
        [topBarbers],
    );

    const toLocalDateString = useCallback((date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }, []);

    const to12Hour = useCallback((time: string): string => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }, []);

    const isSlotExpired = useCallback((slotDate: string, slotTime: string) => {
        if (!slotDate || !slotTime) return false;
        const slotDateTime = new Date(`${slotDate}T${slotTime}:00`);
        if (Number.isNaN(slotDateTime.getTime())) return false;
        return slotDateTime.getTime() < Date.now();
    }, []);

    // Calendar grid calculation
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: React.ReactNode[] = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            days.push(
                <div
                    key={`prev-${day}`}
                    className="h-8 flex items-center justify-center text-xs text-stone-300"
                >
                    {day}
                </div>,
            );
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isPast = date < today;
            const isToday = date.toDateString() === today.toDateString();
            const isSelected =
                selectedDate &&
                date.toDateString() === selectedDate.toDateString();

            days.push(
                <div key={day} className="h-8 flex items-center justify-center">
                    <button
                        type="button"
                        onClick={() => !isPast && setSelectedDate(date)}
                        disabled={isPast}
                        className={`
                            w-7 h-7 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center
                            ${
                                isPast
                                    ? "text-stone-300 cursor-not-allowed"
                                    : "hover:bg-amber-50 text-stone-700"
                            }
                            ${
                                isSelected
                                    ? "!bg-amber-500 !text-stone-950 font-bold shadow-md shadow-amber-500/20 scale-105"
                                    : ""
                            }
                            ${
                                isToday && !isSelected
                                    ? "border border-amber-500/50 text-amber-600 font-semibold"
                                    : ""
                            }
                        `}
                    >
                        {day}
                    </button>
                </div>,
            );
        }

        const totalCells = 42;
        const remaining = totalCells - days.length;
        for (let day = 1; day <= remaining; day++) {
            days.push(
                <div
                    key={`next-${day}`}
                    className="h-8 flex items-center justify-center text-xs text-stone-300"
                >
                    {day}
                </div>,
            );
        }

        return days;
    }, [currentDate, selectedDate]);

    const loadTimeSlots = useCallback(async () => {
        if (!selectedDate) return;
        setIsLoading(true);
        try {
            const dateStr = toLocalDateString(selectedDate);
            const response = await fetch(
                `/admin/time-slots?date=${dateStr}&barber_id=${selectedBarber}`,
                {
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN":
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content") || "",
                    },
                },
            );

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            setTimeSlots(data.time_slots || []);
            setBookedTimes(new Set(data.booked_times || []));
        } catch (error) {
            console.error("Failed to load time slots:", error);
            setTimeSlots([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, selectedBarber, toLocalDateString]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedDate) loadTimeSlots();
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedDate, selectedBarber, loadTimeSlots]);

    const handleToggleSlot = useCallback(
        async (slotId: number, currentStatus: boolean) => {
            const slot = timeSlots.find((item) => item.id === slotId);
            if (slot && isSlotExpired(slot.slot_date, slot.slot_time)) {
                setToast({
                    type: "error",
                    text: "This time slot has already expired and is locked.",
                });
                return;
            }

            try {
                const response = await fetch(
                    `/admin/time-slots/${slotId}/toggle`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN":
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute("content") || "",
                        },
                        body: JSON.stringify({ is_available: !currentStatus }),
                    },
                );
                const data = await response.json();
                if (data.success) {
                    setToast({
                        type: "success",
                        text: "Time slot status updated.",
                    });
                    loadTimeSlots();
                } else {
                    setToast({
                        type: "error",
                        text: data.message || "Failed to update time slot.",
                    });
                }
            } catch (error) {
                console.error("Error toggling slot:", error);
                setToast({
                    type: "error",
                    text: "Failed to update time slot.",
                });
            }
        },
        [isSlotExpired, loadTimeSlots, timeSlots],
    );

    const handleAddSlot = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedDate) return;
            setIsSaving(true);
            try {
                const response = await fetch(`/admin/time-slots`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN":
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content") || "",
                    },
                    body: JSON.stringify({
                        date: toLocalDateString(selectedDate),
                        time: newSlotTime,
                        barber_id: selectedBarber || null,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setToast({
                        type: "success",
                        text: "Time slot added successfully!",
                    });
                    setShowAddSlot(false);
                    loadTimeSlots();
                } else {
                    setToast({
                        type: "error",
                        text: data.message || "Failed to add time slot.",
                    });
                }
            } catch (error) {
                console.error("Error adding slot:", error);
                setToast({ type: "error", text: "Failed to add time slot." });
            } finally {
                setIsSaving(false);
            }
        },
        [
            selectedDate,
            newSlotTime,
            selectedBarber,
            toLocalDateString,
            loadTimeSlots,
        ],
    );

    const createBlockedSlot = useCallback(
        async (slotTime: string) => {
            if (!selectedDate) return;
            if (isSlotExpired(toLocalDateString(selectedDate), slotTime)) {
                setToast({
                    type: "error",
                    text: "This time slot has already expired and is locked.",
                });
                return;
            }
            setIsSaving(true);
            try {
                const response = await fetch(`/admin/time-slots`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN":
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content") || "",
                    },
                    body: JSON.stringify({
                        date: toLocalDateString(selectedDate),
                        time: slotTime,
                        barber_id: selectedBarber || null,
                        is_available: false,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setToast({ type: "success", text: "Time slot blocked." });
                    loadTimeSlots();
                } else {
                    setToast({
                        type: "error",
                        text: data.message || "Failed to block slot.",
                    });
                }
            } catch (e) {
                console.error(e);
                setToast({ type: "error", text: "Failed to block slot." });
            } finally {
                setIsSaving(false);
            }
        },
        [
            selectedDate,
            selectedBarber,
            toLocalDateString,
            loadTimeSlots,
            isSlotExpired,
        ],
    );

    const getStatusBadgeClass = useCallback((status: string) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
                return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
            case "pending":
                return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
            case "completed":
                return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
            case "cancelled":
                return "bg-rose-500/10 text-rose-600 border border-rose-500/20";
            default:
                return "bg-stone-100 text-stone-600 border border-stone-200";
        }
    }, []);

    const kpiCards = useMemo(
        () => [
            {
                label: "Total Bookings",
                value: Number(totalBookings ?? 0).toLocaleString(),
                change: bookingsChange,
                icon: CalendarCheck2,
                color: "amber",
            },
            {
                label: "Total Revenue",
                value: formatPeso(totalRevenue),
                change: revenueChange,
                icon: Banknote,
                color: "emerald",
            },
            {
                label: "Active Clients",
                value: Number(totalCustomers ?? 0).toLocaleString(),
                change: customersChange,
                icon: Users,
                color: "blue",
            },
            {
                label: "Studio Barbers",
                value: Number(totalBarbers ?? 0).toLocaleString(),
                change: avgChange,
                icon: Scissors,
                color: "purple",
            },
        ],
        [
            totalBookings,
            bookingsChange,
            totalRevenue,
            revenueChange,
            totalCustomers,
            customersChange,
            totalBarbers,
            avgChange,
        ],
    );

    const availableSlotsCount = useMemo(() => {
        return ALL_TIME_SLOTS.filter(
            (slot) =>
                !bookedTimes.has(slot) &&
                !timeSlots.find(
                    (s) =>
                        s.slot_time.substring(0, 5) === slot &&
                        !s.is_available,
                ),
        ).length;
    }, [bookedTimes, timeSlots]);

    const limitedLiveActivity = useMemo(
        () => liveActivity.slice(0, 5),
        [liveActivity],
    );

    return (
        <>
            <Head title="Admin Dashboard — BEZ Hair Studio" />

            <AdminToast toast={toast} onClose={() => setToast(null)} />

            <Sidebar>
                <main className="min-h-screen bg-[#f8f7f4]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                        {/* Top Bar Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                                        Studio Overview
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Live System
                                    </span>
                                </div>
                                <p className="text-sm text-stone-500 mt-1">
                                    Performance analytics & operational control for{" "}
                                    <span className="font-medium text-stone-800">
                                        {new Date().toLocaleString("default", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/booking/step-1"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold tracking-wide transition shadow-sm"
                                >
                                    <Plus className="w-4 h-4 text-amber-400" />
                                    New Booking
                                </Link>

                                <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200">
                                    {["7D", "30D", "90D"].map((period, idx) => (
                                        <button
                                            key={period}
                                            type="button"
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                                                idx === 1
                                                    ? "bg-white text-stone-900 shadow-sm font-semibold"
                                                    : "text-stone-500 hover:text-stone-800"
                                            }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* KPI Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {kpiCards.map((card, idx) => {
                                const IconComponent = card.icon;
                                const isPositive = card.change >= 0;

                                return (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:border-amber-500/30 transition-all duration-200 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                                                {card.label}
                                            </span>
                                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="text-2xl font-bold text-stone-900 mt-3 tracking-tight">
                                            {card.value}
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                                            <span
                                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                                                    isPositive
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-rose-50 text-rose-700"
                                                }`}
                                            >
                                                {isPositive ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3" />
                                                )}
                                                {Math.abs(card.change)}%
                                            </span>
                                            <span className="text-stone-400">
                                                vs last month
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Revenue Trend Card */}
                            <div className="lg:col-span-3 flex flex-col h-full">
                                <RevenueTrendCard
                                    data={chartMonthlyData}
                                    growthPercentage={revenueChange}
                                />
                            </div>

                            {/* Admin Time Slot Calendar */}
                            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                                        <div>
                                            <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-amber-500" />
                                                Time Slot Management
                                            </h2>
                                            <p className="text-[11px] text-stone-400">
                                                Configure barber availability
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddSlot(!showAddSlot)}
                                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-semibold transition flex items-center gap-1"
                                        >
                                            {showAddSlot ? (
                                                <X className="w-3 h-3" />
                                            ) : (
                                                <Plus className="w-3 h-3" />
                                            )}
                                            {showAddSlot ? "Close" : "Add Slot"}
                                        </button>
                                    </div>

                                    {/* Month Navigation */}
                                    <div className="flex justify-between items-center my-3 px-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentDate(
                                                    new Date(
                                                        currentDate.getFullYear(),
                                                        currentDate.getMonth() - 1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600 transition"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="font-semibold text-xs text-stone-800">
                                            {MONTHS[currentDate.getMonth()]}{" "}
                                            {currentDate.getFullYear()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentDate(
                                                    new Date(
                                                        currentDate.getFullYear(),
                                                        currentDate.getMonth() + 1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600 transition"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Weekday Labels */}
                                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-stone-400 mb-1">
                                        {WEEKDAYS.map((d) => (
                                            <span key={d}>{d}</span>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDays}
                                    </div>
                                </div>

                                {/* Selected Date Details & Slots */}
                                {selectedDate && (
                                    <div className="mt-4 pt-3 border-t border-stone-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                                {MONTHS[selectedDate.getMonth()]}{" "}
                                                {selectedDate.getDate()}
                                            </div>
                                            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                {availableSlotsCount} slots available
                                            </span>
                                        </div>

                                        {showAddSlot && (
                                            <form
                                                onSubmit={handleAddSlot}
                                                className="mb-3 p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={newSlotTime}
                                                        onChange={(e) =>
                                                            setNewSlotTime(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                                    >
                                                        {ALL_TIME_SLOTS.map(
                                                            (slot) => (
                                                                <option
                                                                    key={slot}
                                                                    value={slot}
                                                                >
                                                                    {to12Hour(
                                                                        slot,
                                                                    )}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <button
                                                        type="submit"
                                                        disabled={isSaving}
                                                        className="px-3 py-1.5 bg-stone-900 text-stone-100 text-xs font-semibold rounded-lg hover:bg-stone-800 transition disabled:opacity-50"
                                                    >
                                                        {isSaving ? "Saving..." : "Add"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {isLoading ? (
                                            <div className="flex justify-center py-4">
                                                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="max-h-36 overflow-y-auto pr-1 space-y-1">
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {ALL_TIME_SLOTS.map((slot) => {
                                                        const slotDateStr =
                                                            selectedDate
                                                                ? toLocalDateString(
                                                                      selectedDate,
                                                                  )
                                                                : "";
                                                        const slotData =
                                                            timeSlots.find(
                                                                (s) =>
                                                                    s.slot_time.substring(
                                                                        0,
                                                                        5,
                                                                    ) === slot,
                                                            );
                                                        const isExpired =
                                                            slotData
                                                                ? isSlotExpired(
                                                                      slotData.slot_date,
                                                                      slotData.slot_time,
                                                                  )
                                                                : isSlotExpired(
                                                                      slotDateStr,
                                                                      slot,
                                                                  );
                                                        const isBooked =
                                                            bookedTimes.has(
                                                                slot,
                                                            );
                                                        const isBlocked =
                                                            !!(
                                                                slotData &&
                                                                (!slotData.is_available ||
                                                                    isExpired)
                                                            );
                                                        const isAvailable =
                                                            !isBooked &&
                                                            !isBlocked;

                                                        return (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (
                                                                        isBooked ||
                                                                        isExpired
                                                                    )
                                                                        return;
                                                                    if (slotData) {
                                                                        handleToggleSlot(
                                                                            slotData.id,
                                                                            slotData.is_available,
                                                                        );
                                                                    } else {
                                                                        createBlockedSlot(
                                                                            slot,
                                                                        );
                                                                    }
                                                                }}
                                                                disabled={
                                                                    isBooked ||
                                                                    isExpired
                                                                }
                                                                className={`
                                                                    py-1 px-1.5 rounded-lg text-[10px] font-medium transition-all duration-150 flex items-center justify-between
                                                                    ${
                                                                        isAvailable
                                                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                                                                            : ""
                                                                    }
                                                                    ${
                                                                        isBooked
                                                                            ? "bg-amber-50 text-amber-900 border border-amber-200 cursor-not-allowed font-semibold"
                                                                            : ""
                                                                    }
                                                                    ${
                                                                        isBlocked && !isExpired
                                                                            ? "bg-stone-100 text-stone-400 line-through border border-stone-200"
                                                                            : ""
                                                                    }
                                                                    ${
                                                                        isExpired
                                                                            ? "bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed"
                                                                            : ""
                                                                    }
                                                                `}
                                                                title={
                                                                    isBooked
                                                                        ? "Booked appointment"
                                                                        : isExpired
                                                                        ? "Locked (Time has passed)"
                                                                        : isAvailable
                                                                        ? "Available - click to block"
                                                                        : "Blocked - click to enable"
                                                                }
                                                            >
                                                                <span>{to12Hour(slot)}</span>
                                                                <span className="text-[9px]">
                                                                    {isExpired ? (
                                                                        <Lock className="w-2.5 h-2.5 opacity-60" />
                                                                    ) : isBooked ? (
                                                                        "•"
                                                                    ) : isAvailable ? (
                                                                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                                                                    ) : (
                                                                        "✕"
                                                                    )}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span>Available</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                <span>Booked</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-stone-300" />
                                                <span>Blocked</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mid Row: Bookings by Day, Top Barbers, Live Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Bookings by Day Chart */}
                            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                                        Bookings by Day
                                    </h3>
                                    <span className="text-[11px] text-amber-600 font-medium">
                                        Peak: Sat/Sun
                                    </span>
                                </div>
                                <div className="h-40 flex items-end gap-2 pt-4">
                                    {[
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                        "Sun",
                                    ].map((day, idx) => {
                                        const count = bookingsByDayData[idx] || 0;
                                        const heightPct = Math.round(
                                            (count / maxDayBookings) * 100,
                                        );

                                        return (
                                            <div
                                                key={day}
                                                className="flex-1 flex flex-col items-center gap-2 group"
                                            >
                                                <span className="text-[10px] font-semibold text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {count}
                                                </span>
                                                <div className="w-full bg-stone-100 h-28 rounded-xl flex items-end overflow-hidden p-0.5">
                                                    <div
                                                        className={`w-full rounded-lg transition-all duration-500 ${
                                                            idx >= 4
                                                                ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm"
                                                                : "bg-stone-800"
                                                        }`}
                                                        style={{
                                                            height: `${Math.max(
                                                                heightPct,
                                                                8,
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-medium text-stone-500">
                                                    {day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Top Barbers Ranking */}
                            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                                        Top Barbers
                                    </h3>
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                </div>

                                {topBarbers.length > 0 ? (
                                    <div className="space-y-3.5">
                                        {topBarbers.map((barber, idx) => {
                                            const pct = Math.round(
                                                (barber.appointment_count /
                                                    totalAppointments) *
                                                    100,
                                            );

                                            return (
                                                <div key={idx} className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-semibold text-stone-800">
                                                            {barber.full_name}
                                                        </span>
                                                        <span className="text-stone-500 font-medium">
                                                            {barber.appointment_count}{" "}
                                                            cuts ({pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-600 to-amber-400"
                                                            style={{
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-40 flex items-center justify-center text-xs text-stone-400">
                                        No barber performance data recorded yet.
                                    </div>
                                )}
                            </div>

                            {/* Live Activity Feed */}
                            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                                        Live Activity
                                    </h3>
                                    <span className="text-[11px] font-medium text-stone-400">
                                        Recent events
                                    </span>
                                </div>

                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {limitedLiveActivity &&
                                    limitedLiveActivity.length > 0 ? (
                                        limitedLiveActivity.map(
                                            (activity, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-stone-50 transition"
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                activity.color ||
                                                                "#d97706",
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-stone-800 leading-snug">
                                                            {activity.message}
                                                        </p>
                                                        <span className="text-[10px] text-stone-400">
                                                            {activity.timeAgo}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="h-40 flex items-center justify-center text-xs text-stone-400">
                                            No recent activity stream.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Appointments Table */}
                        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-stone-900">
                                        Recent Studio Appointments
                                    </h2>
                                    <p className="text-xs text-stone-400 mt-0.5">
                                        Latest bookings submitted via customer portal
                                    </p>
                                </div>

                                <Link
                                    href="/admin/appointments"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
                                >
                                    View Full Schedule
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-stone-50/75 border-b border-stone-100 text-stone-400 uppercase text-[10px] tracking-wider">
                                            <th className="py-3 px-5 font-semibold">
                                                Client
                                            </th>
                                            <th className="py-3 px-5 font-semibold">
                                                Service
                                            </th>
                                            <th className="py-3 px-5 font-semibold">
                                                Barber
                                            </th>
                                            <th className="py-3 px-5 font-semibold">
                                                Schedule
                                            </th>
                                            <th className="py-3 px-5 font-semibold">
                                                Price
                                            </th>
                                            <th className="py-3 px-5 font-semibold">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 text-stone-700">
                                        {recentAppointments.length > 0 ? (
                                            recentAppointments.map((apt) => {
                                                const clientName =
                                                    apt.first_name ||
                                                    apt.last_name
                                                        ? `${apt.first_name || ""} ${apt.last_name || ""}`.trim()
                                                        : apt.booking_full_name ||
                                                          "Client";
                                                const initials = clientName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase();

                                                return (
                                                    <tr
                                                        key={apt.id}
                                                        className="hover:bg-amber-50/30 transition-colors"
                                                    >
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-[11px] border border-stone-200">
                                                                    {initials}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-stone-900">
                                                                        {clientName}
                                                                    </div>
                                                                    <div className="text-[11px] text-stone-400">
                                                                        {apt.email ||
                                                                            apt.booking_email ||
                                                                            "No email"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-5 font-medium text-stone-800">
                                                            {apt.hairstyle_name || "Haircut"}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-stone-600">
                                                            {apt.barber_name || "Any Barber"}
                                                        </td>
                                                        <td className="py-3.5 px-5">
                                                            <div className="font-medium text-stone-900">
                                                                {apt.appointment_date
                                                                    ? new Date(
                                                                          apt.appointment_date,
                                                                      ).toLocaleDateString(
                                                                          "en-US",
                                                                          {
                                                                              month: "short",
                                                                              day: "numeric",
                                                                          },
                                                                      )
                                                                    : "N/A"}
                                                            </div>
                                                            <div className="text-[11px] text-stone-400">
                                                                {apt.appointment_time
                                                                    ? to12Hour(
                                                                          apt.appointment_time.slice(
                                                                              0,
                                                                              5,
                                                                          ),
                                                                      )
                                                                    : ""}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-5 font-semibold text-stone-900">
                                                            {formatPeso(apt.total_price)}
                                                        </td>
                                                        <td className="py-3.5 px-5">
                                                            <span
                                                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(
                                                                    apt.status,
                                                                )}`}
                                                            >
                                                                {apt.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-12 text-center text-stone-400"
                                                >
                                                    No appointments scheduled yet.
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
