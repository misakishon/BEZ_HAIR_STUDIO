import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import RevenueTrendCard, { MonthlyData } from "../components/RevenueTrendCard";
import AdminToast, { ToastMessage } from "../../components/AdminToast";
import {
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    Clock,
    Lock,
    Check,
    Calendar,
    ArrowUpRight,
} from "lucide-react";

interface BarberOption {
    id: number;
    full_name: string;
}

interface DashboardProps {
    range?: string;
    barbers?: BarberOption[];
    totalBookings?: number;
    totalRevenue?: number;
    totalCustomers?: number;
    totalBarbers?: number;
    topBarbers?: Array<{ full_name: string; appointment_count: number }>;
    recentAppointments?: Array<{
        id: number;
        first_name?: string;
        last_name?: string;
        email?: string;
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
    bookingsByDay?: Record<string, number> | number[];
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

const PERIOD_OPTIONS = [
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
    { key: "90d", label: "90D" },
    { key: "all", label: "All" },
];

function formatPeso(value: number): string {
    return `₱${Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: 0,
    })}`;
}

export default function Dashboard({
    range = "all",
    barbers = [],
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
    const [isRangeSwitching, setIsRangeSwitching] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);

    const handleRangeChange = (nextRange: string) => {
        if (nextRange === range) return;
        router.get(
            "/admin/dashboard",
            { range: nextRange },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsRangeSwitching(true),
                onFinish: () => setIsRangeSwitching(false),
            },
        );
    };

    const rangeLabel = useMemo(() => {
        switch (range) {
            case "7d":
                return "Last 7 days";
            case "30d":
                return "Last 30 days";
            case "90d":
                return "Last 90 days";
            default:
                return "All-time confirmed records";
        }
    }, [range]);

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

    const totalAppointmentsByBarber = useMemo(
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
                    className="flex h-9 items-center justify-center text-xs text-[#C7C3B9] tabular-nums"
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
                <div
                    key={day}
                    className="flex h-9 items-center justify-center"
                >
                    <button
                        type="button"
                        onClick={() => !isPast && setSelectedDate(date)}
                        disabled={isPast}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium tabular-nums transition-all duration-150 ease-out ${
                            isPast
                                ? "cursor-not-allowed text-[#C7C3B9]"
                                : "text-[#4D4B45] hover:bg-[#EFECE5] hover:text-[#1C1B18] active:scale-95"
                        } ${
                            isSelected
                                ? "!bg-[#252420] !font-semibold !text-[#FAF9F5] shadow-[0_1px_2px_rgba(28,27,24,0.12)]"
                                : ""
                        } ${
                            isToday && !isSelected
                                ? "border border-[#252420] font-semibold text-[#1C1B18]"
                                : ""
                        }`}
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
                    className="flex h-9 items-center justify-center text-xs text-[#C7C3B9] tabular-nums"
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
        }, 200);
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
                        text: "Time slot added successfully.",
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
                return "border-[#D2E0D0] bg-[#EDF3EC] text-[#2E5A36]";
            case "pending":
                return "border-[#EADBB8] bg-[#FAF3E1] text-[#875B14]";
            case "completed":
                return "border-[#33312C] bg-[#252420] text-[#FAF9F5]";
            case "cancelled":
                return "border-[#E9CECE] bg-[#F9ECEC] text-[#8E3535]";
            default:
                return "border-[#E5E2DA] bg-[#F3F1EC] text-[#5C5953]";
        }
    }, []);

    const availableSlotsCount = useMemo(() => {
        return ALL_TIME_SLOTS.filter((slot) => {
            const slotDateStr = selectedDate
                ? toLocalDateString(selectedDate)
                : "";
            const slotData = timeSlots.find(
                (s) => s.slot_time.substring(0, 5) === slot,
            );
            const expired = slotData
                ? isSlotExpired(slotData.slot_date, slotData.slot_time)
                : isSlotExpired(slotDateStr, slot);
            const blocked = !!(
                slotData &&
                (!slotData.is_available || expired)
            );
            return !bookedTimes.has(slot) && !blocked && !expired;
        }).length;
    }, [bookedTimes, timeSlots, selectedDate, toLocalDateString, isSlotExpired]);

    const limitedRecentConfirmations = useMemo(
        () => liveActivity.slice(0, 5),
        [liveActivity],
    );

    return (
        <>
            <Head title="Admin Dashboard — BEZ Hair Studio" />

            <AdminToast toast={toast} onClose={() => setToast(null)} />

            <Sidebar>
                <main className="min-h-screen bg-[#F5F4EF] text-[#1C1B18]">
                    <div
                        className={`studio-enter mx-auto max-w-7xl space-y-6 px-4 py-7 transition-opacity duration-200 sm:px-6 lg:px-8 ${
                            isRangeSwitching ? "opacity-70" : "opacity-100"
                        }`}
                    >
                        {/* Page Header */}
                        <div className="flex flex-col justify-between gap-4 border-b border-[#E5E2DA] pb-6 sm:flex-row sm:items-end">
                            <div>
                                <span className="font-morche text-[11px] font-semibold uppercase tracking-[0.2em] text-[#918E85]">
                                    Studio Operations
                                </span>
                                <h1 className="mt-1 font-morche text-2xl font-medium tracking-tight text-[#1C1B18] sm:text-3xl">
                                    Studio Overview
                                </h1>
                                <p className="mt-1 text-xs text-[#737069] sm:text-sm">
                                    {rangeLabel} ·{" "}
                                    {new Date().toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Working Period Filter */}
                                <div
                                    role="group"
                                    aria-label="Metrics date range"
                                    className="inline-flex items-center rounded-lg border border-[#E5E2DA] bg-[#FDFCF9] p-1 shadow-[0_1px_2px_rgba(28,27,24,0.03)]"
                                >
                                    {PERIOD_OPTIONS.map((period) => {
                                        const active = range === period.key;
                                        return (
                                            <button
                                                key={period.key}
                                                type="button"
                                                onClick={() =>
                                                    handleRangeChange(
                                                        period.key,
                                                    )
                                                }
                                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-out active:scale-[0.97] ${
                                                    active
                                                        ? "bg-[#252420] text-[#FAF9F5] shadow-[0_1px_2px_rgba(28,27,24,0.1)]"
                                                        : "text-[#6F6D68] hover:bg-[#F3F1EC] hover:text-[#1C1B18]"
                                                }`}
                                            >
                                                {period.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Link
                                    href="/booking/step-1"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#252420] px-5 py-2.5 text-xs font-semibold text-[#FAF9F5] shadow-[0_1px_2px_rgba(28,27,24,0.12)] transition-all duration-200 hover:bg-[#373530] active:scale-[0.98]"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    New Booking
                                </Link>
                            </div>
                        </div>

                        {/* Architectural KPI Strip */}
                        <section
                            aria-label="Key performance metrics"
                            className="grid grid-cols-1 divide-y divide-[#E5E2DA] overflow-hidden rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] shadow-[0_1px_2px_rgba(28,27,24,0.03)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
                        >
                            <div className="border-[#E5E2DA] p-5 transition-colors duration-200 hover:bg-[#FAF9F5] sm:border-b sm:border-r lg:border-b-0 lg:border-r-0">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918E85]">
                                    Confirmed Revenue
                                </span>
                                <div className="mt-2 text-2xl font-bold tracking-tight text-[#1C1B18] tabular-nums sm:text-3xl">
                                    {formatPeso(totalRevenue)}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-[#737069] tabular-nums">
                                    <span className="font-medium text-[#3D3B36]">
                                        {formatPeso(currentMonthRevenue)}
                                    </span>
                                    <span>this month</span>
                                    {revenueChange !== 0 && (
                                        <span
                                            className={`font-semibold ${
                                                revenueChange > 0
                                                    ? "text-[#2E5A36]"
                                                    : "text-[#8E3535]"
                                            }`}
                                        >
                                            ({revenueChange > 0 ? "+" : ""}
                                            {revenueChange}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-[#E5E2DA] p-5 transition-colors duration-200 hover:bg-[#FAF9F5] sm:border-b lg:border-b-0">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918E85]">
                                    Confirmed Bookings
                                </span>
                                <div className="mt-2 text-2xl font-bold tracking-tight text-[#1C1B18] tabular-nums sm:text-3xl">
                                    {Number(totalBookings ?? 0).toLocaleString()}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-[#737069] tabular-nums">
                                    <span className="font-medium text-[#3D3B36]">
                                        {formatPeso(avgPerVisit)}
                                    </span>
                                    <span>avg ticket</span>
                                    {bookingsChange !== 0 && (
                                        <span
                                            className={`font-semibold ${
                                                bookingsChange > 0
                                                    ? "text-[#2E5A36]"
                                                    : "text-[#8E3535]"
                                            }`}
                                        >
                                            ({bookingsChange > 0 ? "+" : ""}
                                            {bookingsChange}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-[#E5E2DA] p-5 transition-colors duration-200 hover:bg-[#FAF9F5] sm:border-r lg:border-r-0">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918E85]">
                                    Unique Clients
                                </span>
                                <div className="mt-2 text-2xl font-bold tracking-tight text-[#1C1B18] tabular-nums sm:text-3xl">
                                    {Number(totalCustomers ?? 0).toLocaleString()}
                                </div>
                                <div className="mt-2 text-xs text-[#737069]">
                                    Distinct emails with confirmed visits
                                </div>
                            </div>

                            <div className="p-5 transition-colors duration-200 hover:bg-[#FAF9F5]">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918E85]">
                                    Active Barbers
                                </span>
                                <div className="mt-2 text-2xl font-bold tracking-tight text-[#1C1B18] tabular-nums sm:text-3xl">
                                    {Number(totalBarbers ?? 0).toLocaleString()}
                                </div>
                                <div className="mt-2 text-xs text-[#737069]">
                                    <Link
                                        href="/admin/barbers"
                                        className="font-medium text-[#3D3B36] underline underline-offset-4 transition-colors hover:text-[#1C1B18]"
                                    >
                                        Manage availability
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Primary Row: Revenue Trend + Recent Confirmed Appointments (7 cols) + Time Slot Management (5 cols) */}
                        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                            <div className="flex flex-col gap-6 lg:col-span-7">
                                <RevenueTrendCard
                                    data={chartMonthlyData}
                                    growthPercentage={revenueChange}
                                />

                                {/* Recent Studio Appointments Table */}
                                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] shadow-[0_1px_2px_rgba(28,27,24,0.03)] transition-colors duration-200 hover:border-[#D8D4CB]">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2DA] p-5">
                                        <div>
                                            <h2 className="text-sm font-semibold text-[#1C1B18]">
                                                Recent Confirmed Appointments
                                            </h2>
                                            <p className="mt-0.5 text-xs text-[#737069]">
                                                Latest confirmed bookings
                                                scheduled at the studio
                                            </p>
                                        </div>

                                        <Link
                                            href="/admin/appointments"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DA] bg-[#FDFCF9] px-3 py-1.5 text-xs font-semibold text-[#1C1B18] transition-all duration-150 hover:border-[#252420] hover:bg-[#F3F1EC] active:scale-[0.98]"
                                        >
                                            View Full Schedule
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>

                                    <div className="studio-scrollbar overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-[#E5E2DA] bg-[#F5F4EF] text-[10px] font-semibold uppercase tracking-wider text-[#737069]">
                                                    <th className="px-4 py-3">
                                                        Client
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Service
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Barber
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Schedule
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Price
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#EFECE5] text-[#3D3B36]">
                                                {recentAppointments.length > 0 ? (
                                                    recentAppointments.map(
                                                        (apt) => {
                                                            const clientName =
                                                                apt.first_name ||
                                                                apt.last_name
                                                                    ? `${apt.first_name || ""} ${apt.last_name || ""}`.trim()
                                                                    : apt.booking_full_name ||
                                                                      "Client";
                                                            const initials =
                                                                clientName
                                                                    .split(" ")
                                                                    .map(
                                                                        (n) =>
                                                                            n[0],
                                                                    )
                                                                    .join("")
                                                                    .slice(0, 2)
                                                                    .toUpperCase();

                                                            return (
                                                                <tr
                                                                    key={apt.id}
                                                                    className="transition-colors duration-150 hover:bg-[#F5F4EF]/80"
                                                                >
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#252420] text-[10px] font-semibold text-[#FAF9F5]">
                                                                                {
                                                                                    initials
                                                                                }
                                                                            </div>
                                                                            <div className="max-w-[140px] min-w-0">
                                                                                <div className="truncate font-semibold text-[#1C1B18]">
                                                                                    {
                                                                                        clientName
                                                                                    }
                                                                                </div>
                                                                                <div className="truncate text-[11px] text-[#918E85]">
                                                                                    {apt.email ||
                                                                                        apt.booking_email ||
                                                                                        "No email"}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 font-medium text-[#252420]">
                                                                        {apt.hairstyle_name ||
                                                                            "Haircut"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-[#5C5953]">
                                                                        {apt.barber_name ||
                                                                            "Any Barber"}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                                                                        <div className="font-medium text-[#1C1B18]">
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
                                                                        <div className="text-[11px] text-[#918E85]">
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
                                                                    <td className="px-4 py-3 font-semibold whitespace-nowrap text-[#1C1B18] tabular-nums">
                                                                        {formatPeso(
                                                                            apt.total_price,
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <span
                                                                            className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(
                                                                                apt.status,
                                                                            )}`}
                                                                        >
                                                                            {
                                                                                apt.status
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="py-12 text-center text-[#918E85]"
                                                        >
                                                            No confirmed
                                                            appointments
                                                            recorded yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Time Slot Management */}
                            <div className="flex h-full flex-col rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)] transition-colors duration-200 hover:border-[#D8D4CB] lg:col-span-5">
                                <div>
                                    <div className="flex items-start justify-between gap-3 border-b border-[#EFECE5] pb-4">
                                        <div>
                                            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1C1B18]">
                                                <Calendar className="h-4 w-4 text-[#5C5953]" />
                                                Time Slot Management
                                            </h2>
                                            <p className="mt-0.5 text-xs text-[#737069]">
                                                Block or open slots per day
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddSlot(!showAddSlot)
                                            }
                                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                                                showAddSlot
                                                    ? "border-[#252420] bg-[#252420] text-[#FAF9F5]"
                                                    : "border-[#E5E2DA] bg-[#FDFCF9] text-[#3D3B36] hover:border-[#C2BDB1] hover:bg-[#F3F1EC]"
                                            }`}
                                        >
                                            {showAddSlot ? (
                                                <X className="h-3.5 w-3.5" />
                                            ) : (
                                                <Plus className="h-3.5 w-3.5" />
                                            )}
                                            {showAddSlot ? "Close" : "Add Slot"}
                                        </button>
                                    </div>

                                    {/* Barber Filter */}
                                    {barbers.length > 0 && (
                                        <div className="mt-3">
                                            <label
                                                htmlFor="dashboard-barber-filter"
                                                className="sr-only"
                                            >
                                                Filter slots by barber
                                            </label>
                                            <select
                                                id="dashboard-barber-filter"
                                                value={selectedBarber}
                                                onChange={(e) =>
                                                    setSelectedBarber(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="w-full rounded-lg border border-[#E5E2DA] bg-[#F5F4EF] px-3 py-1.5 text-xs font-medium text-[#3D3B36] transition-colors focus:border-[#252420] focus:bg-[#FDFCF9] focus:outline-none focus:ring-0"
                                            >
                                                <option value={0}>
                                                    All Barbers
                                                </option>
                                                {barbers.map((barber) => (
                                                    <option
                                                        key={barber.id}
                                                        value={barber.id}
                                                    >
                                                        {barber.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Month Navigation */}
                                    <div className="my-3 flex items-center justify-between px-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentDate(
                                                    new Date(
                                                        currentDate.getFullYear(),
                                                        currentDate.getMonth() -
                                                            1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-[#5C5953] transition-all duration-150 hover:border-[#E5E2DA] hover:bg-[#F3F1EC] hover:text-[#1C1B18] active:scale-95"
                                            aria-label="Previous month"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-xs font-semibold text-[#1C1B18]">
                                            {MONTHS[currentDate.getMonth()]}{" "}
                                            {currentDate.getFullYear()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentDate(
                                                    new Date(
                                                        currentDate.getFullYear(),
                                                        currentDate.getMonth() +
                                                            1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-[#5C5953] transition-all duration-150 hover:border-[#E5E2DA] hover:bg-[#F3F1EC] hover:text-[#1C1B18] active:scale-95"
                                            aria-label="Next month"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Weekday Labels */}
                                    <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[#918E85]">
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
                                    <div className="mt-5 flex flex-1 flex-col border-t border-[#EFECE5] pt-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1B18]">
                                                <Clock className="h-3.5 w-3.5 text-[#737069]" />
                                                {MONTHS[selectedDate.getMonth()]}{" "}
                                                {selectedDate.getDate()}
                                            </div>
                                            <span className="rounded-md border border-[#D2E0D0] bg-[#EDF3EC] px-2 py-0.5 text-[11px] font-medium text-[#2E5A36] tabular-nums">
                                                {availableSlotsCount} open
                                            </span>
                                        </div>

                                        {showAddSlot && (
                                            <form
                                                onSubmit={handleAddSlot}
                                                className="studio-enter mb-3 rounded-lg border border-[#E5E2DA] bg-[#F5F4EF] p-2.5"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={newSlotTime}
                                                        onChange={(e) =>
                                                            setNewSlotTime(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 rounded-lg border border-[#E5E2DA] bg-[#FDFCF9] px-2.5 py-1.5 text-xs text-[#1C1B18] focus:border-[#252420] focus:outline-none focus:ring-0"
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
                                                        className="rounded-lg bg-[#252420] px-3 py-1.5 text-xs font-semibold text-[#FAF9F5] transition-all duration-150 hover:bg-[#373530] active:scale-[0.97] disabled:opacity-50"
                                                    >
                                                        {isSaving
                                                            ? "Saving..."
                                                            : "Add"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {isLoading ? (
                                            <div className="flex flex-1 items-center justify-center py-8">
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#252420] border-t-transparent" />
                                            </div>
                                        ) : (
                                            <div className="studio-scrollbar flex-1 overflow-y-auto pr-1">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {ALL_TIME_SLOTS.map(
                                                        (slot) => {
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
                                                                        ) ===
                                                                        slot,
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
                                                                        if (
                                                                            slotData
                                                                        ) {
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
                                                                    className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-[10px] font-medium tabular-nums transition-all duration-150 ease-out active:scale-[0.97] ${
                                                                        isBooked
                                                                            ? "cursor-not-allowed border-[#33312C] bg-[#252420] font-semibold text-[#FAF9F5]"
                                                                            : isExpired
                                                                              ? "cursor-not-allowed border-[#EDEAE3] bg-[#F5F4EF] text-[#C7C3B9]"
                                                                              : isBlocked
                                                                                ? "border-[#E5E2DA] bg-[#EFECE5] text-[#918E85] line-through hover:border-[#C2BDB1]"
                                                                                : "border-[#E5E2DA] bg-[#FDFCF9] text-[#252420] hover:border-[#B8B3A8] hover:bg-[#F5F4EF]"
                                                                    }`}
                                                                    title={
                                                                        isBooked
                                                                            ? "Booked appointment"
                                                                            : isExpired
                                                                              ? "Locked (time passed)"
                                                                              : isAvailable
                                                                                ? "Available — click to block"
                                                                                : "Blocked — click to enable"
                                                                    }
                                                                >
                                                                    <span>
                                                                        {to12Hour(
                                                                            slot,
                                                                        )}
                                                                    </span>
                                                                    <span className="text-[9px]">
                                                                        {isExpired ? (
                                                                            <Lock className="h-2.5 w-2.5 opacity-60" />
                                                                        ) : isBooked ? (
                                                                            "•"
                                                                        ) : isAvailable ? (
                                                                            <Check className="h-2.5 w-2.5 text-[#2E5A36]" />
                                                                        ) : (
                                                                            "✕"
                                                                        )}
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto flex items-center justify-center gap-4 border-t border-[#EFECE5] pt-3.5 text-[10px] font-medium text-[#737069]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full border border-[#B8B3A8] bg-[#FDFCF9]" />
                                                <span>Open</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-[#252420]" />
                                                <span>Booked</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-[#D5D0C5]" />
                                                <span>Blocked</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Secondary Analytics Row: Bookings by Day, Top Barbers, Recent Confirmations */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Bookings by Day */}
                            <div className="rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)] transition-colors duration-200 hover:border-[#D8D4CB]">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918E85]">
                                        Bookings by Day
                                    </h3>
                                    <span className="text-[11px] font-medium text-[#737069]">
                                        {range === "all" ? "All time" : range.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex h-36 items-end gap-2 pt-2">
                                    {[
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                        "Sun",
                                    ].map((day, idx) => {
                                        const count =
                                            bookingsByDayData[idx] || 0;
                                        const heightPct = Math.round(
                                            (count / maxDayBookings) * 100,
                                        );

                                        return (
                                            <div
                                                key={day}
                                                className="group flex flex-1 flex-col items-center gap-1.5"
                                            >
                                                <span className="text-[10px] font-semibold text-[#3D3B36] opacity-0 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:opacity-100 tabular-nums">
                                                    {count}
                                                </span>
                                                <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-[#EFECE5] p-0.5">
                                                    <div
                                                        className={`w-full rounded-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                            idx >= 4
                                                                ? "bg-[#252420]"
                                                                : "bg-[#8D8980]"
                                                        }`}
                                                        style={{
                                                            height: `${
                                                                count > 0
                                                                    ? Math.max(
                                                                          heightPct,
                                                                          10,
                                                                      )
                                                                    : 4
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-medium text-[#737069]">
                                                    {day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Top Barbers */}
                            <div className="rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)] transition-colors duration-200 hover:border-[#D8D4CB]">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918E85]">
                                        Top Barbers
                                    </h3>
                                    <span className="text-[11px] font-medium text-[#737069]">
                                        Confirmed cuts
                                    </span>
                                </div>

                                {topBarbers.length > 0 ? (
                                    <div className="space-y-3.5">
                                        {topBarbers.map((barber, idx) => {
                                            const pct = Math.round(
                                                (barber.appointment_count /
                                                    totalAppointmentsByBarber) *
                                                    100,
                                            );

                                            return (
                                                <div
                                                    key={idx}
                                                    className="space-y-1.5"
                                                >
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-semibold text-[#1C1B18]">
                                                            {barber.full_name}
                                                        </span>
                                                        <span className="font-medium text-[#737069] tabular-nums">
                                                            {
                                                                barber.appointment_count
                                                            }{" "}
                                                            ({pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFECE5]">
                                                        <div
                                                            className="h-full rounded-full bg-[#252420] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
                                    <div className="flex h-36 items-center justify-center text-xs text-[#918E85]">
                                        No barber performance data recorded yet.
                                    </div>
                                )}
                            </div>

                            {/* Recent Confirmations */}
                            <div className="rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)] transition-colors duration-200 hover:border-[#D8D4CB]">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918E85]">
                                        Recent Confirmations
                                    </h3>
                                    <span className="text-[11px] font-medium text-[#737069]">
                                        Latest 5
                                    </span>
                                </div>

                                <div className="studio-scrollbar max-h-40 space-y-2 overflow-y-auto pr-1">
                                    {limitedRecentConfirmations.length > 0 ? (
                                        limitedRecentConfirmations.map(
                                            (activity, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-3 rounded-lg border border-transparent p-1.5 transition-colors duration-150 hover:border-[#E5E2DA] hover:bg-[#F5F4EF]"
                                                >
                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#252420]" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-medium text-[#1C1B18]">
                                                            {activity.message}
                                                        </p>
                                                        <span className="text-[11px] text-[#918E85]">
                                                            {activity.timeAgo}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="flex h-32 items-center justify-center text-xs text-[#918E85]">
                                            No confirmed activity yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </Sidebar>
        </>
    );
}
