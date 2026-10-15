import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, Link } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import RevenueTrendCard, { MonthlyData } from "../components/RevenueTrendCard";

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
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    // Memoized derived data
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

    // Memoized calendar render
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: JSX.Element[] = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            days.push(
                <div
                    key={`prev-${day}`}
                    className="h-9 flex items-center justify-center text-sm text-gray-300"
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
                <div key={day} className="h-9 flex items-center justify-center">
                    <button
                        onClick={() => !isPast && setSelectedDate(date)}
                        disabled={isPast}
                        className={`
                            w-8 h-8 rounded-full text-sm font-medium transition-all duration-150
                            ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
                            ${isSelected ? "bg-amber-600 text-white shadow-lg scale-105" : ""}
                            ${isToday && !isSelected ? "border-2 border-amber-600 text-amber-600" : ""}
                            ${!isPast && !isSelected ? "hover:bg-gray-100 text-gray-700" : ""}
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
                    className="h-9 flex items-center justify-center text-sm text-gray-300"
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
    }, [selectedDate, selectedBarber]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedDate) loadTimeSlots();
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedDate, selectedBarber, loadTimeSlots]);

    const toLocalDateString = useCallback((date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }, []);

    const to12Hour = useCallback((time: string): string => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
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

    const handleToggleSlot = useCallback(
        async (slotId: number, currentStatus: boolean) => {
            const slot = timeSlots.find((item) => item.id === slotId);
            if (slot && isSlotExpired(slot.slot_date, slot.slot_time)) {
                setMessage({
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
                    setMessage({
                        type: "success",
                        text: "Time slot updated successfully!",
                    });
                    loadTimeSlots();
                    setTimeout(() => setMessage(null), 3000);
                } else {
                    setMessage({
                        type: "error",
                        text: data.message || "Failed to update time slot.",
                    });
                }
            } catch (error) {
                console.error("Error toggling slot:", error);
                setMessage({
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
                    setMessage({
                        type: "success",
                        text: "Time slot added successfully!",
                    });
                    setShowAddSlot(false);
                    loadTimeSlots();
                    setTimeout(() => setMessage(null), 3000);
                } else {
                    setMessage({
                        type: "error",
                        text: data.message || "Failed to add time slot.",
                    });
                }
            } catch (error) {
                console.error("Error adding slot:", error);
                setMessage({ type: "error", text: "Failed to add time slot." });
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
                setMessage({
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
                    setMessage({ type: "success", text: "Time slot added." });
                    loadTimeSlots();
                } else {
                    setMessage({
                        type: "error",
                        text: data.message || "Failed to add slot.",
                    });
                }
            } catch (e) {
                console.error(e);
                setMessage({ type: "error", text: "Failed to add slot." });
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
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-orange-100 text-orange-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    }, []);

    const kpiCards = useMemo(
        () => [
            {
                label: "Revenue",
                value: `₱${Number(totalRevenue ?? 0).toFixed(2)}`,
                change: revenueChange,
            },
            {
                label: "Total Bookings",
                value: totalBookings.toLocaleString(),
                change: bookingsChange,
            },
            {
                label: "Customers",
                value: totalCustomers.toLocaleString(),
                change: customersChange,
            },
            {
                label: "Avg. Per Visit",
                value: `₱${Number(avgPerVisit ?? 0).toFixed(2)}`,
                change: avgChange,
            },
        ],
        [
            totalRevenue,
            totalBookings,
            totalCustomers,
            avgPerVisit,
            revenueChange,
            bookingsChange,
            customersChange,
            avgChange,
        ],
    );

    const availableSlotsCount = useMemo(() => {
        return ALL_TIME_SLOTS.filter(
            (slot) =>
                !bookedTimes.has(slot) &&
                !timeSlots.some(
                    (s) =>
                        s.slot_time.substring(0, 5) === slot && !s.is_available,
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
            <Sidebar>
                <main className="min-h-screen bg-[#f0ede7]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        {/* Top Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Analytics Overview
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Studio performance ·{" "}
                                    {new Date().toLocaleString("default", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Live
                                </span>
                                {["7D", "30D", "90D"].map((period) => (
                                    <button
                                        key={period}
                                        className="px-3 py-1.5 rounded-md text-xs font-medium transition bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {kpiCards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-lg p-4 shadow-sm"
                                >
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400">
                                        {card.label}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">
                                        {card.value}
                                    </div>
                                    <div
                                        className={`text-xs font-medium mt-1.5 ${card.change >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {card.change >= 0 ? "↑" : "↓"}{" "}
                                        {Math.abs(card.change)}% vs last month
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                            {/* Revenue Trend — Custom RevenueTrendCard */}
                            <div className="lg:col-span-3 flex flex-col h-full">
                                <RevenueTrendCard
                                    data={chartMonthlyData}
                                    growthPercentage={revenueChange}
                                />
                            </div>

                            {/* Admin Calendar */}
                            <div className="lg:col-span-2 bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400">
                                        Manage Time Slots
                                    </div>
                                    <button
                                        onClick={() =>
                                            setShowAddSlot(!showAddSlot)
                                        }
                                        className="text-xs text-amber-600 hover:text-amber-700 transition font-medium"
                                    >
                                        {showAddSlot ? "Cancel" : "+ Add Slot"}
                                    </button>
                                </div>

                                <div className="mb-2">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <button
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
                                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-sm"
                                        >
                                            ←
                                        </button>
                                        <span className="font-semibold text-xs">
                                            {MONTHS[currentDate.getMonth()]}{" "}
                                            {currentDate.getFullYear()}
                                        </span>
                                        <button
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
                                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-sm"
                                        >
                                            →
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                                        {WEEKDAYS.map((day) => (
                                            <div
                                                key={day}
                                                className="text-center text-[9px] font-medium text-gray-400 py-0.5"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {calendarDays}
                                    </div>
                                </div>

                                {selectedDate && (
                                    <div className="mt-1.5 pt-2 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-medium text-gray-700">
                                                {
                                                    MONTHS[
                                                        selectedDate.getMonth()
                                                    ]
                                                }{" "}
                                                {selectedDate.getDate()},{" "}
                                                {selectedDate.getFullYear()}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {availableSlotsCount} slots
                                                available
                                            </span>
                                        </div>

                                        {message && (
                                            <div
                                                className={`mb-2 p-1.5 rounded text-xs ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                                            >
                                                {message.text}
                                            </div>
                                        )}

                                        {showAddSlot && (
                                            <form
                                                onSubmit={handleAddSlot}
                                                className="mb-2 p-2 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex gap-1.5">
                                                    <select
                                                        value={newSlotTime}
                                                        onChange={(e) =>
                                                            setNewSlotTime(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
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
                                                        className="px-3 py-1 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                                                    >
                                                        {isSaving
                                                            ? "Adding..."
                                                            : "Add"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {isLoading ? (
                                            <div className="flex justify-center py-2">
                                                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <div className="max-h-32 overflow-y-auto pr-0.5 scrollbar-thin">
                                                <div className="grid grid-cols-3 gap-1">
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
                                                                    className={`
                                                                    py-1 px-1.5 text-[9px] font-medium rounded transition-all duration-150
                                                                    ${!slotData && isAvailable ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" : ""}
                                                                    ${slotData && slotData.is_available && !isExpired ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" : ""}
                                                                    ${isBlocked || isBooked ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200" : ""}
                                                                    ${isExpired ? "bg-red-100 text-red-700 border border-red-300 cursor-not-allowed" : ""}
                                                                `}
                                                                    title={
                                                                        isBooked
                                                                            ? "Booked by customer"
                                                                            : isExpired
                                                                              ? "Expired slot - locked automatically"
                                                                              : slotData
                                                                                ? slotData.is_available
                                                                                    ? "Available - Click to block"
                                                                                    : "Blocked - Click to make available"
                                                                                : "Available (not configured) - Click to block"
                                                                    }
                                                                >
                                                                    {to12Hour(
                                                                        slot,
                                                                    )}
                                                                    <span className="block text-[7px] opacity-60">
                                                                        {isExpired
                                                                            ? "LOCK"
                                                                            : isAvailable
                                                                              ? "✓"
                                                                              : "✗"}
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center gap-3 mt-1.5 pt-1.5 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2.5 h-2.5 rounded bg-green-50 border border-green-200"></div>
                                                <span className="text-[8px] text-gray-500">
                                                    Available
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2.5 h-2.5 rounded bg-red-50 border border-red-200"></div>
                                                <span className="text-[8px] text-gray-500">
                                                    Booked
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2.5 h-2.5 rounded bg-gray-100"></div>
                                                <span className="text-[8px] text-gray-500">
                                                    Not Set
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!selectedDate && (
                                    <div className="text-center py-4 text-gray-400 text-xs">
                                        Select a date to manage time slots
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
                                    Bookings by Day
                                </div>
                                <div className="h-36">
                                    <div className="flex h-full items-end gap-2">
                                        {[
                                            "Mon",
                                            "Tue",
                                            "Wed",
                                            "Thu",
                                            "Fri",
                                            "Sat",
                                            "Sun",
                                        ].map((day, idx) => (
                                            <div
                                                key={day}
                                                className="flex-1 flex flex-col items-center gap-1"
                                            >
                                                <div
                                                    className="w-full bg-[#c9a84c] rounded-t transition-all duration-500"
                                                    style={{
                                                        height: `${(bookingsByDayData[idx] / maxDayBookings) * 100}px`,
                                                        opacity:
                                                            idx === 5
                                                                ? 1
                                                                : idx === 4
                                                                  ? 0.8
                                                                  : 0.5,
                                                    }}
                                                ></div>
                                                <div className="text-[9px] text-gray-400">
                                                    {day}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
                                    Top Barbers
                                </div>
                                {topBarbers.length > 0 ? (
                                    topBarbers.map((barber, idx) => {
                                        const pct = Math.round(
                                            (barber.appointment_count /
                                                totalAppointments) *
                                                100,
                                        );
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 mb-2 last:mb-0"
                                            >
                                                <div className="text-xs text-gray-500 w-14 truncate">
                                                    {(
                                                        barber.full_name || ""
                                                    ).split(" ")[0] || "N/A"}
                                                </div>
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background: [
                                                                "#c9a84c",
                                                                "#0a0a0a",
                                                                "#8a8a8a",
                                                                "#d4d4d4",
                                                            ][idx % 4],
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-400 w-7 text-right">
                                                    {pct}%
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-sm text-gray-500 text-center py-6">
                                        No barber data available
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
                                    Live Activity
                                </div>
                                <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                                    {limitedLiveActivity &&
                                    limitedLiveActivity.length > 0 ? (
                                        limitedLiveActivity.map(
                                            (activity, idx) => {
                                                const statusTexts: Record<
                                                    string,
                                                    string
                                                > = {
                                                    pending: "New booking",
                                                    confirmed: "Confirmed",
                                                    completed: "Completed",
                                                    cancelled: "Cancelled",
                                                };
                                                const boldText =
                                                    statusTexts[
                                                        activity.status
                                                    ] || activity.status;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 pb-2 border-b border-gray-50 last:border-0"
                                                    >
                                                        <div
                                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                            style={{
                                                                background:
                                                                    activity.color,
                                                            }}
                                                        ></div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs text-gray-600">
                                                                <strong className="text-gray-800">
                                                                    {boldText}
                                                                </strong>
                                                                <span className="break-words">
                                                                    {activity.message.substring(
                                                                        boldText.length,
                                                                    )}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="text-[9px] text-gray-400 flex-shrink-0">
                                                            {activity.timeAgo}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center py-6">
                                            No recent activity
                                        </div>
                                    )}
                                    {liveActivity.length > 5 && (
                                        <div className="text-center text-[9px] text-gray-400 pt-1">
                                            Showing 5 of {liveActivity.length}{" "}
                                            activities
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Appointments Table */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-[9px] uppercase tracking-wider text-gray-400">
                                    Recent Appointments
                                </div>
                                <Link
                                    href="/admin/appointments"
                                    className="text-[9px] uppercase tracking-wider text-gray-400 hover:text-black transition"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Client
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Appointment
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Barber
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Time
                                            </th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAppointments.length > 0 ? (
                                            recentAppointments.map((apt) => (
                                                <tr
                                                    key={apt.id}
                                                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                                                >
                                                    <td className="py-2 px-2 font-medium text-gray-900">
                                                        {apt.first_name ||
                                                        apt.last_name
                                                            ? `${apt.first_name || ""} ${apt.last_name || ""}`.trim()
                                                            : apt.booking_full_name ||
                                                              "N/A"}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-500 text-xs">
                                                        {apt.email ||
                                                            apt.booking_email ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-700">
                                                        {apt.hairstyle_name ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-500">
                                                        {apt.barber_name ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-500">
                                                        {apt.appointment_date
                                                            ? new Date(
                                                                  apt.appointment_date,
                                                              ).toLocaleDateString(
                                                                  "en-US",
                                                                  {
                                                                      month: "short",
                                                                      day: "numeric",
                                                                      year: "numeric",
                                                                  },
                                                              )
                                                            : "N/A"}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-500">
                                                        {apt.appointment_time
                                                            ? new Date(
                                                                  `2000-01-01T${apt.appointment_time}`,
                                                              ).toLocaleTimeString(
                                                                  "en-US",
                                                                  {
                                                                      hour: "numeric",
                                                                      minute: "2-digit",
                                                                      hour12: true,
                                                                  },
                                                              )
                                                            : "N/A"}
                                                    </td>
                                                    <td className="py-2 px-2">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${getStatusBadgeClass(apt.status)}`}
                                                        >
                                                            {apt.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="py-8 text-center text-gray-500"
                                                >
                                                    No appointments found.
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
