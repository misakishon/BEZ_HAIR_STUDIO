import React, { useCallback, useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";

interface Appointment {
    id: number;
    client_name: string;
    email: string;
    barber_name: string;
    hairstyle_name: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    payment_method: string;
    payment_status: string;
    payment_source_id?: string | null;
    total_price: number;
    receipt_image?: string | null;
    notes?: string | null;
    phone?: string | null;
    confirmation_number?: string | null;
    service_ticket_confirmation_number?: string | null;
}

interface AppointmentsProps {
    appointments: Appointment[];
    statusFilter: string;
    dateFilter: string;
}

interface BarberOption {
    id: number;
    full_name: string;
    specialty?: string | null;
}

interface TimeSlotOption {
    id?: number;
    slot_time: string;
    slot_date?: string;
    is_available?: boolean;
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

export default function Appointments({
    appointments = [],
    statusFilter = "all",
    dateFilter = "today",
}: AppointmentsProps) {
    const [selectedStatus, setSelectedStatus] = useState(statusFilter);
    const [selectedDate, setSelectedDate] = useState(dateFilter);
    const [isUpdating, setIsUpdating] = useState(false);
    const [appointmentList, setAppointmentList] = useState(appointments);
    const [selectedReceipt, setSelectedReceipt] = useState<{
        image: string;
        paymentSourceId?: string | null;
    } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const [changeAppointmentId, setChangeAppointmentId] = useState<
        number | null
    >(null);
    const [changeAppointmentDate, setChangeAppointmentDate] = useState("");
    const [changeAppointmentTime, setChangeAppointmentTime] = useState("");
    const [changeAppointmentBarberId, setChangeAppointmentBarberId] = useState<
        number | null
    >(null);
    const [changeAppointmentBarbers, setChangeAppointmentBarbers] = useState<
        BarberOption[]
    >([]);
    const [changeAppointmentTimeSlots, setChangeAppointmentTimeSlots] =
        useState<TimeSlotOption[]>([]);
    const [changeAppointmentBookedTimes, setChangeAppointmentBookedTimes] =
        useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [changeAppointmentCalendarMonth, setChangeAppointmentCalendarMonth] =
        useState<Date>(new Date());
    const REFRESH_INTERVAL_MS = 5000;

    useEffect(() => {
        setAppointmentList(appointments);
    }, [appointments]);

    const refreshAppointments = useCallback(() => {
        router.get(
            "/admin/appointments",
            { status: selectedStatus, date: selectedDate },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["appointments", "statusFilter", "dateFilter"],
            },
        );
    }, [selectedDate, selectedStatus]);

    useEffect(() => {
        refreshAppointments();
    }, [refreshAppointments]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            refreshAppointments();
        }, REFRESH_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [refreshAppointments]);

    const getStatusBadgeClass = (status: string) => {
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
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case "credit_card":
                return "Card";
            case "gcash":
            case "mobile_money":
                return "GCash";
            case "cash":
                return "Cash";
            default:
                return method
                    ? method.charAt(0).toUpperCase() + method.slice(1)
                    : "Cash";
        }
    };

    const formatAppointmentDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatAppointmentTime = (timeStr: string | null | undefined) => {
        if (!timeStr) return "N/A";
        const date = new Date(`2000-01-01T${timeStr}`);
        if (Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const generateConfirmationNumber = (id: number) => {
        return "BZ-" + String(id).padStart(6, "0");
    };

    const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDateLabel = (dateStr: string) => {
        if (!dateStr) return "Choose a date";
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        if (Number.isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getCalendarDays = (baseDate: Date) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay();
        const totalDays = lastDay.getDate();
        const days: Array<{
            date: Date;
            isCurrentMonth: boolean;
            isToday: boolean;
            isPast: boolean;
            isSelected: boolean;
        }> = [];

        for (let i = 0; i < startOffset; i++) {
            const prevDate = new Date(year, month, i - startOffset + 1);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                isToday: false,
                isPast: prevDate < new Date(new Date().setHours(0, 0, 0, 0)),
                isSelected: false,
            });
        }

        for (let day = 1; day <= totalDays; day++) {
            const currentDate = new Date(year, month, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            days.push({
                date: currentDate,
                isCurrentMonth: true,
                isToday: currentDate.toDateString() === today.toDateString(),
                isPast: currentDate < today,
                isSelected:
                    changeAppointmentDate === toLocalDateString(currentDate),
            });
        }

        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const nextDate = new Date(year, month + 1, i);
            days.push({
                date: nextDate,
                isCurrentMonth: false,
                isToday: false,
                isPast: nextDate < new Date(new Date().setHours(0, 0, 0, 0)),
                isSelected: false,
            });
        }

        return days;
    };

    const formatTimeLabel = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = Number(hours);
        const suffix = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${suffix}`;
    };

    const isSlotExpired = (slotDate: string, slotTime: string) => {
        if (!slotDate || !slotTime) return false;

        const slotDateTime = new Date(`${slotDate}T${slotTime}:00`);
        if (Number.isNaN(slotDateTime.getTime())) return false;

        return slotDateTime.getTime() < Date.now();
    };

    useEffect(() => {
        if (
            !changeModalOpen ||
            !changeAppointmentDate ||
            !changeAppointmentBarberId
        ) {
            setChangeAppointmentTimeSlots([]);
            setChangeAppointmentBookedTimes([]);
            return;
        }

        const loadAvailability = async () => {
            setIsLoadingAvailability(true);
            try {
                const response = await fetch(
                    `/admin/time-slots?date=${changeAppointmentDate}&barber_id=${changeAppointmentBarberId}`,
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

                const data = await parseJsonResponse(response);

                if (response.ok && data.success) {
                    setChangeAppointmentTimeSlots(
                        Array.isArray(data.time_slots) ? data.time_slots : [],
                    );
                    setChangeAppointmentBookedTimes(
                        Array.isArray(data.booked_times)
                            ? data.booked_times
                            : [],
                    );
                } else {
                    setChangeAppointmentTimeSlots([]);
                    setChangeAppointmentBookedTimes([]);
                }
            } catch (error) {
                console.error("Unable to load appointment availability", error);
                setChangeAppointmentTimeSlots([]);
                setChangeAppointmentBookedTimes([]);
            } finally {
                setIsLoadingAvailability(false);
            }
        };

        loadAvailability();
    }, [changeModalOpen, changeAppointmentDate, changeAppointmentBarberId]);

    const sortedAppointments = [...appointmentList].sort((a, b) => {
        const dateA = new Date(a.appointment_date || 0).getTime();
        const dateB = new Date(b.appointment_date || 0).getTime();

        if (dateA !== dateB) return dateA - dateB;

        return (a.appointment_time || "").localeCompare(
            b.appointment_time || "",
        );
    });

    // Filter appointments based on search term
    const filteredAppointments = sortedAppointments.filter((apt) => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase().trim();
        const confirmationNumber =
            apt.confirmation_number || generateConfirmationNumber(apt.id);
        const serviceTicketNumber =
            apt.service_ticket_confirmation_number || "";

        return (
            confirmationNumber.toLowerCase().includes(searchLower) ||
            serviceTicketNumber.toLowerCase().includes(searchLower) ||
            (apt.client_name &&
                apt.client_name.toLowerCase().includes(searchLower)) ||
            (apt.email && apt.email.toLowerCase().includes(searchLower)) ||
            (apt.barber_name &&
                apt.barber_name.toLowerCase().includes(searchLower)) ||
            (apt.hairstyle_name &&
                apt.hairstyle_name.toLowerCase().includes(searchLower)) ||
            (apt.phone && apt.phone.includes(searchTerm.trim())) ||
            (apt.id && apt.id.toString().includes(searchTerm.trim()))
        );
    });

    const parseJsonResponse = async (response: Response) => {
        const text = await response.text();

        if (!text || !text.trim()) {
            return {};
        }

        const trimmed = text.trim();

        if (trimmed.startsWith("<")) {
            throw new Error(
                "The server returned an HTML page instead of JSON. Please refresh the page and confirm your admin session is still active.",
            );
        }

        try {
            return JSON.parse(trimmed);
        } catch {
            throw new Error(
                "The server returned an invalid JSON response. Please try again.",
            );
        }
    };

    const handleConfirmPayment = async (id: number) => {
        if (!confirm(`Confirm booking #${id} and send service ticket?`)) return;

        setIsUpdating(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                alert("Error: CSRF token not found");
                setIsUpdating(false);
                return;
            }

            const response = await fetch(
                "/admin/appointments/confirm-payment",
                {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({ appointment_id: id }),
                },
            );

            const data = await parseJsonResponse(response);

            if (response.ok && data.success) {
                alert(
                    data.message ||
                        "Booking confirmed and service ticket sent!",
                );
                refreshAppointments();
            } else {
                alert(
                    "Error: " + (data.message || "Failed to confirm booking"),
                );
            }
        } catch (error) {
            console.error("Error:", error);
            alert(
                "Error confirming booking: " +
                    (error instanceof Error ? error.message : "Unknown error"),
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelAppointment = async (id: number) => {
        if (!confirm(`Are you sure you want to cancel appointment #${id}?`))
            return;

        setIsUpdating(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                alert("Error: CSRF token not found");
                setIsUpdating(false);
                return;
            }

            const response = await fetch("/admin/appointments/cancel", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ appointment_id: id }),
            });

            const data = await parseJsonResponse(response);

            if (response.ok && data.success) {
                setAppointmentList((prev) =>
                    prev.filter((apt) => apt.id !== id),
                );
                alert("Appointment cancelled successfully!");
            } else {
                alert(
                    "Error: " +
                        (data.message || "Failed to cancel appointment"),
                );
            }
        } catch (error) {
            console.error("Cancel appointment error:", error);
            alert(
                "Error cancelling appointment: " +
                    (error instanceof Error ? error.message : "Unknown error"),
            );
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        if (changeModalOpen) {
            if (changeAppointmentDate) {
                const [year, month, day] = changeAppointmentDate
                    .split("-")
                    .map(Number);
                setChangeAppointmentCalendarMonth(
                    new Date(year, month - 1, day),
                );
            } else {
                setChangeAppointmentCalendarMonth(new Date());
            }
        }
    }, [changeModalOpen, changeAppointmentDate]);

    const openChangeAppointmentModal = async (appointment: Appointment) => {
        setChangeAppointmentId(appointment.id);
        setChangeAppointmentDate(appointment.appointment_date || "");
        setChangeAppointmentTime(
            appointment.appointment_time
                ? appointment.appointment_time.slice(0, 5)
                : "",
        );
        setChangeAppointmentBarberId(null);
        setChangeModalOpen(true);

        try {
            const response = await fetch("/api/barbers", {
                credentials: "same-origin",
            });

            if (response.ok) {
                const data = await response.json();
                const barbers = Array.isArray(data) ? data : [];
                setChangeAppointmentBarbers(barbers);

                const matchingBarber = barbers.find(
                    (barber: BarberOption) =>
                        barber.full_name === appointment.barber_name,
                );

                if (matchingBarber) {
                    setChangeAppointmentBarberId(matchingBarber.id);
                } else if (barbers.length > 0) {
                    setChangeAppointmentBarberId(barbers[0].id);
                }
            }
        } catch (error) {
            console.error("Unable to load barbers", error);
        }
    };

    const closeChangeAppointmentModal = () => {
        setChangeModalOpen(false);
        setChangeAppointmentId(null);
        setChangeAppointmentDate("");
        setChangeAppointmentTime("");
        setChangeAppointmentBarberId(null);
        setChangeAppointmentBarbers([]);
        setChangeAppointmentTimeSlots([]);
        setChangeAppointmentBookedTimes([]);
    };

    const handleChangeAppointmentSubmit = async () => {
        if (
            !changeAppointmentId ||
            !changeAppointmentDate ||
            !changeAppointmentTime ||
            !changeAppointmentBarberId
        ) {
            alert("Please fill in the date, time, and barber before saving.");
            return;
        }

        setIsUpdating(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                alert("Error: CSRF token not found");
                setIsUpdating(false);
                return;
            }

            const response = await fetch(
                `/admin/appointments/${changeAppointmentId}/change`,
                {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        booking_date: changeAppointmentDate,
                        booking_time: changeAppointmentTime,
                        barber_id: changeAppointmentBarberId,
                    }),
                },
            );

            const data = await parseJsonResponse(response);

            if (response.ok && data.success) {
                closeChangeAppointmentModal();
                refreshAppointments();
                alert(data.message || "Appointment updated successfully.");
            } else {
                alert(
                    "Error: " +
                        (data.message || "Failed to update appointment"),
                );
            }
        } catch (error) {
            console.error("Change appointment error:", error);
            alert(
                "Error updating appointment: " +
                    (error instanceof Error ? error.message : "Unknown error"),
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const openReceiptModal = (
        receiptImage: string | null | undefined,
        paymentSourceId?: string | null,
    ) => {
        if (receiptImage) {
            setSelectedReceipt({
                image: `/uploads/paymentImage/${receiptImage}`,
                paymentSourceId,
            });
        }
    };

    const closeReceiptModal = () => {
        setSelectedReceipt(null);
    };

    const filters = [
        { key: "all", label: "All", status: "all", date: "all" },
        { key: "today", label: "Today", status: "all", date: "today" },
        { key: "upcoming", label: "Upcoming", status: "all", date: "upcoming" },
        { key: "past", label: "Past", status: "all", date: "past" },
        { key: "pending", label: "Pending", status: "pending", date: "all" },
        {
            key: "confirmed",
            label: "Confirmed",
            status: "confirmed",
            date: "all",
        },
        {
            key: "cancelled",
            label: "Cancelled",
            status: "cancelled",
            date: "all",
        },
        {
            key: "completed",
            label: "Completed",
            status: "completed",
            date: "all",
        },
    ];

    const isFilterActive = (filter: (typeof filters)[0]) => {
        if (filter.key === "all") {
            return selectedStatus === "all" && selectedDate === "all";
        }
        if (filter.date !== "all") {
            return selectedDate === filter.date;
        }
        if (filter.status !== "all") {
            return selectedStatus === filter.status;
        }
        return false;
    };

    const handleFilterClick = (filter: (typeof filters)[0]) => {
        if (filter.key === "all") {
            setSelectedStatus("all");
            setSelectedDate("all");
        } else if (filter.date !== "all") {
            setSelectedDate(filter.date);
            setSelectedStatus("all");
        } else if (filter.status !== "all") {
            setSelectedStatus(filter.status);
            setSelectedDate("all");
        }
    };

    // Clear search input
    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <>
            <Head title="Appointments — BEZ Hair Studio" />
            <Sidebar>
                <main className="min-h-screen bg-[#f0ede7]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    APPOINTMENTS
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage all client bookings
                                </p>
                            </div>
                            <Link
                                href="/booking/step-1"
                                className="px-6 py-2.5 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 transition rounded-lg"
                            >
                                + New Booking
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by Booking Confirmation (BZ-XXXXXX), Service Ticket (ST-XXXXXX), Name, Email, Phone..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <svg
                                            className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {searchTerm && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Found {filteredAppointments.length} result
                                    {filteredAppointments.length !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => handleFilterClick(filter)}
                                    className={`
                                        px-4 py-1.5 rounded-md text-xs font-medium transition-all
                                        ${isFilterActive(filter) ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}
                                    `}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto px-2 sm:px-0">
                                <table className="min-w-[1200px] w-full text-sm divide-y divide-gray-200">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">
                                                Booking Confirmation
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Service Ticket
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Client
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Service
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Barber
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Time
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Payment
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Payment ID
                                            </th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-500 text-[10px] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAppointments.length > 0 ? (
                                            filteredAppointments.map((apt) => {
                                                const confirmationNumber =
                                                    apt.confirmation_number ||
                                                    generateConfirmationNumber(
                                                        apt.id,
                                                    );
                                                return (
                                                    <tr
                                                        key={apt.id}
                                                        className="border-b border-gray-50 hover:bg-gray-50 transition"
                                                    >
                                                        <td className="py-3 px-2 sm:px-4">
                                                            <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                                {
                                                                    confirmationNumber
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-900 whitespace-nowrap">
                                                            {apt.service_ticket_confirmation_number ||
                                                                "Not sent yet"}
                                                        </td>
                                                        <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium whitespace-nowrap">
                                                            {apt.client_name ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="py-3 px-2 sm:px-4 text-gray-500 text-xs whitespace-nowrap">
                                                            {apt.email || "N/A"}
                                                        </td>
                                                        <td className="py-3 px-2 sm:px-4 text-gray-700 whitespace-nowrap">
                                                            {apt.hairstyle_name ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="py-4 px-4 text-gray-500">
                                                            {apt.barber_name ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="py-4 px-4 text-gray-500">
                                                            {formatAppointmentDate(
                                                                apt.appointment_date,
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-gray-500">
                                                            {formatAppointmentTime(
                                                                apt.appointment_time,
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${getStatusBadgeClass(apt.status)}`}
                                                            >
                                                                {apt.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 sm:px-4 text-sm text-gray-600">
                                                            <div>
                                                                {getPaymentMethodLabel(
                                                                    apt.payment_method ||
                                                                        "cash",
                                                                )}
                                                            </div>
                                                            {apt.payment_status && (
                                                                <div className="text-xs text-gray-400 capitalize">
                                                                    {
                                                                        apt.payment_status
                                                                    }
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-2 sm:px-4 text-sm text-gray-600 break-words max-w-[150px]">
                                                            {apt.payment_source_id ? (
                                                                <span className="font-mono text-xs text-gray-700 break-all">
                                                                    {
                                                                        apt.payment_source_id
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">
                                                                    N/A
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            {apt.receipt_image ? (
                                                                <button
                                                                    onClick={() =>
                                                                        openReceiptModal(
                                                                            apt.receipt_image,
                                                                            apt.payment_source_id,
                                                                        )
                                                                    }
                                                                    className="text-blue-600 hover:text-blue-800 transition text-xs underline"
                                                                >
                                                                    View Receipt
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">
                                                                    No receipt
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-2">
                                                                {apt.status ===
                                                                    "pending" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleConfirmPayment(
                                                                                apt.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isUpdating
                                                                        }
                                                                        className="text-gray-400 hover:text-green-600 transition disabled:opacity-50"
                                                                        title="Confirm Booking & Send Service Ticket"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">
                                                                            check_circle
                                                                        </span>
                                                                    </button>
                                                                )}
                                                                {apt.status ===
                                                                    "confirmed" && (
                                                                    <span className="text-green-600 text-xs font-medium">
                                                                        ✓ Sent
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() =>
                                                                        openChangeAppointmentModal(
                                                                            apt,
                                                                        )
                                                                    }
                                                                    className="text-gray-400 hover:text-blue-600 transition"
                                                                    title="Change Appointment"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">
                                                                        event_repeat
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleCancelAppointment(
                                                                            apt.id,
                                                                        )
                                                                    }
                                                                    className="text-gray-400 hover:text-red-600 transition"
                                                                    title="Cancel"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">
                                                                        cancel
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={12}
                                                    className="py-8 text-center text-gray-500 px-4"
                                                >
                                                    {searchTerm ? (
                                                        <div>
                                                            <p className="text-lg">
                                                                No results found
                                                                for "
                                                                {searchTerm}"
                                                            </p>
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                Try adjusting
                                                                your search
                                                                terms
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "No appointments found."
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                                <div className="text-xs text-gray-500">
                                    Showing {filteredAppointments.length} of{" "}
                                    {appointmentList.length} appointments
                                    {searchTerm &&
                                        ` (filtered by "${searchTerm}")`}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-xs text-gray-500 hover:border-black hover:text-black transition">
                                        <span className="material-symbols-outlined text-base">
                                            chevron_left
                                        </span>
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center border border-black rounded text-xs text-white bg-black">
                                        1
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-xs text-gray-500 hover:border-black hover:text-black transition">
                                        <span className="material-symbols-outlined text-base">
                                            chevron_right
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </Sidebar>

            {/* Change Appointment Modal */}
            {changeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            onClick={closeChangeAppointmentModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg
                                className="w-6 h-6"
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
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Change Appointment
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Pick a new date, time, and barber for this
                                booking.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <div className="rounded-lg border border-gray-300 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setChangeAppointmentCalendarMonth(
                                                        new Date(
                                                            changeAppointmentCalendarMonth.getFullYear(),
                                                            changeAppointmentCalendarMonth.getMonth() -
                                                                1,
                                                            1,
                                                        ),
                                                    )
                                                }
                                                className="text-gray-500 hover:text-black"
                                            >
                                                ←
                                            </button>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {
                                                    MONTHS[
                                                        changeAppointmentCalendarMonth.getMonth()
                                                    ]
                                                }{" "}
                                                {changeAppointmentCalendarMonth.getFullYear()}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setChangeAppointmentCalendarMonth(
                                                        new Date(
                                                            changeAppointmentCalendarMonth.getFullYear(),
                                                            changeAppointmentCalendarMonth.getMonth() +
                                                                1,
                                                            1,
                                                        ),
                                                    )
                                                }
                                                className="text-gray-500 hover:text-black"
                                            >
                                                →
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {WEEKDAYS.map((day) => (
                                                <div
                                                    key={day}
                                                    className="text-center text-[10px] font-medium text-gray-400"
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {getCalendarDays(
                                                changeAppointmentCalendarMonth,
                                            ).map((day, index) => {
                                                const isDisabled =
                                                    day.isPast ||
                                                    !day.isCurrentMonth;
                                                const isSelected =
                                                    day.isSelected;

                                                return (
                                                    <button
                                                        key={`${day.date.toDateString()}-${index}`}
                                                        type="button"
                                                        disabled={isDisabled}
                                                        onClick={() => {
                                                            setChangeAppointmentDate(
                                                                toLocalDateString(
                                                                    day.date,
                                                                ),
                                                            );
                                                            setChangeAppointmentTime(
                                                                "",
                                                            );
                                                        }}
                                                        className={`h-8 rounded-md text-sm transition ${
                                                            isSelected
                                                                ? "bg-black text-white"
                                                                : day.isToday
                                                                  ? "bg-amber-100 text-amber-700"
                                                                  : day.isCurrentMonth
                                                                    ? "text-gray-700 hover:bg-gray-100"
                                                                    : "text-gray-300"
                                                        }`}
                                                    >
                                                        {day.date.getDate()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Selected:{" "}
                                        {formatDateLabel(changeAppointmentDate)}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Available Time
                                        </label>
                                        {isLoadingAvailability && (
                                            <span className="text-xs text-gray-500">
                                                Loading times...
                                            </span>
                                        )}
                                    </div>

                                    {!changeAppointmentDate ||
                                    !changeAppointmentBarberId ? (
                                        <p className="text-sm text-gray-500">
                                            Select a date and barber to view the
                                            available time slots.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                                            {ALL_TIME_SLOTS.map((slot) => {
                                                const slotData =
                                                    changeAppointmentTimeSlots.find(
                                                        (item) =>
                                                            item.slot_time.substring(
                                                                0,
                                                                5,
                                                            ) === slot,
                                                    );
                                                const isExpired = slotData
                                                    ? isSlotExpired(
                                                          slotData.slot_date ||
                                                              changeAppointmentDate,
                                                          slotData.slot_time,
                                                      )
                                                    : isSlotExpired(
                                                          changeAppointmentDate,
                                                          slot,
                                                      );
                                                const isBooked =
                                                    changeAppointmentBookedTimes.includes(
                                                        slot,
                                                    );
                                                const isBlocked = !!(
                                                    slotData &&
                                                    (!slotData.is_available ||
                                                        isExpired)
                                                );
                                                const isAvailable =
                                                    !isBooked && !isBlocked;
                                                const isSelected =
                                                    changeAppointmentTime ===
                                                    slot;

                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() =>
                                                            setChangeAppointmentTime(
                                                                slot,
                                                            )
                                                        }
                                                        disabled={
                                                            isBooked ||
                                                            isExpired ||
                                                            isLoadingAvailability
                                                        }
                                                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                                                            isSelected
                                                                ? "border-black bg-black text-white"
                                                                : isAvailable
                                                                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                                                  : "border-red-200 bg-red-50 text-red-700"
                                                        }`}
                                                        title={
                                                            isBooked
                                                                ? "Booked"
                                                                : isBlocked
                                                                  ? "Blocked"
                                                                  : "Available"
                                                        }
                                                    >
                                                        {formatTimeLabel(slot)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="h-2.5 w-2.5 rounded-full bg-green-50 border border-green-200"></span>
                                            Available
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="h-2.5 w-2.5 rounded-full bg-red-50 border border-red-200"></span>
                                            Booked / Blocked
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Barber
                                    </label>
                                    <select
                                        value={changeAppointmentBarberId ?? ""}
                                        onChange={(e) =>
                                            setChangeAppointmentBarberId(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        {changeAppointmentBarbers.length > 0 ? (
                                            changeAppointmentBarbers.map(
                                                (barber) => (
                                                    <option
                                                        key={barber.id}
                                                        value={barber.id}
                                                    >
                                                        {barber.full_name}
                                                    </option>
                                                ),
                                            )
                                        ) : (
                                            <option value="">
                                                No barbers available
                                            </option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closeChangeAppointmentModal}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangeAppointmentSubmit}
                                    disabled={isUpdating}
                                    className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition disabled:opacity-50"
                                >
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={closeReceiptModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg
                                className="w-6 h-6"
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
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Payment Receipt
                            </h3>
                            {selectedReceipt.paymentSourceId && (
                                <div className="mb-4 text-left text-sm text-gray-600">
                                    <span className="font-semibold">
                                        PayMongo Payment ID:
                                    </span>{" "}
                                    {selectedReceipt.paymentSourceId}
                                </div>
                            )}
                            <img
                                src={selectedReceipt.image}
                                alt="Payment Receipt"
                                className="w-full max-h-[70vh] object-contain border rounded-lg"
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    img.style.display = "none";
                                    const parent = img.parentElement;
                                    if (parent) {
                                        const fallbackDiv =
                                            document.createElement("div");
                                        fallbackDiv.className =
                                            "p-8 bg-gray-100 rounded-lg";
                                        fallbackDiv.innerHTML = `
                                            <div class="text-center">
                                                <span class="text-4xl text-gray-400 block">📷</span>
                                                <p class="text-sm text-gray-500 mt-2">Receipt image not found</p>
                                                <p class="text-xs text-gray-400 mt-1">Please check the file path</p>
                                            </div>
                                        `;
                                        parent.appendChild(fallbackDiv);
                                    }
                                }}
                            />
                            <button
                                onClick={closeReceiptModal}
                                className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
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
