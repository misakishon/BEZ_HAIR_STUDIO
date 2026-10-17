import React, { useCallback, useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import AdminToast, { ToastMessage } from "../../components/AdminToast";
import AdminConfirmModal from "../../components/AdminConfirmModal";
import {
    Plus,
    Search,
    X,
    CheckCircle2,
    CalendarClock,
    Trash2,
    Eye,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Scissors,
    User,
    CreditCard,
    DollarSign,
    Sparkles,
} from "lucide-react";

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

function formatPeso(value: number): string {
    return `₱${Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: 0,
    })}`;
}

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
    const [changeAppointmentId, setChangeAppointmentId] = useState<number | null>(null);
    const [changeAppointmentDate, setChangeAppointmentDate] = useState("");
    const [changeAppointmentTime, setChangeAppointmentTime] = useState("");
    const [changeAppointmentBarberId, setChangeAppointmentBarberId] = useState<number | null>(null);
    const [changeAppointmentBarbers, setChangeAppointmentBarbers] = useState<BarberOption[]>([]);
    const [changeAppointmentTimeSlots, setChangeAppointmentTimeSlots] = useState<TimeSlotOption[]>([]);
    const [changeAppointmentBookedTimes, setChangeAppointmentBookedTimes] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [changeAppointmentCalendarMonth, setChangeAppointmentCalendarMonth] = useState<Date>(new Date());
    
    // Toast & Confirm Modal state
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [confirmModalState, setConfirmModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        isDestructive: boolean;
        action: () => Promise<void>;
    }>({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        isDestructive: false,
        action: async () => {},
    });

    const REFRESH_INTERVAL_MS = 10000;

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
        switch (status?.toLowerCase()) {
            case "confirmed":
                return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
            case "pending":
                return "bg-amber-500/10 text-amber-700 border border-amber-500/20";
            case "completed":
                return "bg-blue-500/10 text-blue-700 border border-blue-500/20";
            case "cancelled":
                return "bg-rose-500/10 text-rose-700 border border-rose-500/20";
            default:
                return "bg-stone-100 text-stone-700 border border-stone-200";
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method?.toLowerCase()) {
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
        const dateA = new Date(
            `${a.appointment_date}T${a.appointment_time || "00:00"}`,
        ).getTime();
        const dateB = new Date(
            `${b.appointment_date}T${b.appointment_time || "00:00"}`,
        ).getTime();
        return dateB - dateA;
    });

    const filteredAppointments = sortedAppointments.filter((apt) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase().trim();
        const clientName = (apt.client_name || "").toLowerCase();
        const email = (apt.email || "").toLowerCase();
        const phone = (apt.phone || "").toLowerCase();
        const confirmationNumber = (
            apt.confirmation_number || generateConfirmationNumber(apt.id)
        ).toLowerCase();
        const serviceTicketConfirmationNumber = (
            apt.service_ticket_confirmation_number || ""
        ).toLowerCase();
        const barberName = (apt.barber_name || "").toLowerCase();
        const hairstyleName = (apt.hairstyle_name || "").toLowerCase();

        return (
            confirmationNumber.includes(term) ||
            serviceTicketConfirmationNumber.includes(term) ||
            clientName.includes(term) ||
            email.includes(term) ||
            phone.includes(term) ||
            barberName.includes(term) ||
            hairstyleName.includes(term)
        );
    });

    const parseJsonResponse = async (response: Response) => {
        const text = await response.text();
        if (!text) return {};
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

    const requestConfirmPayment = (id: number) => {
        setConfirmModalState({
            isOpen: true,
            title: "Confirm Booking & Service Ticket",
            message: `Are you sure you want to confirm booking #${id}? An official service ticket and calendar receipt will be issued to the client.`,
            confirmText: "Confirm Booking",
            isDestructive: false,
            action: async () => {
                setIsUpdating(true);
                try {
                    const csrfToken = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content");

                    if (!csrfToken) {
                        setToast({ type: "error", text: "CSRF token not found. Please refresh." });
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
                        setToast({
                            type: "success",
                            text: data.message || "Booking confirmed and service ticket sent!",
                        });
                        refreshAppointments();
                    } else {
                        setToast({
                            type: "error",
                            text: data.message || "Failed to confirm booking.",
                        });
                    }
                } catch (error) {
                    console.error("Error:", error);
                    setToast({
                        type: "error",
                        text: error instanceof Error ? error.message : "Error confirming booking.",
                    });
                } finally {
                    setIsUpdating(false);
                    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    const requestCancelAppointment = (id: number) => {
        setConfirmModalState({
            isOpen: true,
            title: "Cancel Appointment",
            message: `Are you sure you want to cancel appointment #${id}? This will release the barber time slot and update client booking records.`,
            confirmText: "Cancel Appointment",
            isDestructive: true,
            action: async () => {
                setIsUpdating(true);
                try {
                    const csrfToken = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content");

                    if (!csrfToken) {
                        setToast({ type: "error", text: "CSRF token not found." });
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
                        setToast({
                            type: "success",
                            text: "Appointment cancelled successfully.",
                        });
                    } else {
                        setToast({
                            type: "error",
                            text: data.message || "Failed to cancel appointment.",
                        });
                    }
                } catch (error) {
                    console.error("Cancel appointment error:", error);
                    setToast({
                        type: "error",
                        text: error instanceof Error ? error.message : "Error cancelling appointment.",
                    });
                } finally {
                    setIsUpdating(false);
                    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

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
            const response = await fetch("/admin/appointments/barbers", {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            const data = await parseJsonResponse(response);
            if (response.ok && Array.isArray(data.barbers)) {
                setChangeAppointmentBarbers(data.barbers);
                const currentBarber = data.barbers.find(
                    (b: BarberOption) => b.full_name === appointment.barber_name,
                );
                if (currentBarber) {
                    setChangeAppointmentBarberId(currentBarber.id);
                } else if (data.barbers[0]) {
                    setChangeAppointmentBarberId(data.barbers[0].id);
                }
            } else {
                setChangeAppointmentBarbers([]);
            }
        } catch (error) {
            console.error("Unable to load barber options", error);
            setChangeAppointmentBarbers([]);
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
            setToast({
                type: "error",
                text: "Please select a date, time, and barber before saving.",
            });
            return;
        }

        setIsUpdating(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                setToast({ type: "error", text: "CSRF token not found." });
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
                setToast({
                    type: "success",
                    text: data.message || "Appointment updated successfully.",
                });
            } else {
                setToast({
                    type: "error",
                    text: data.message || "Failed to update appointment.",
                });
            }
        } catch (error) {
            console.error("Change appointment error:", error);
            setToast({
                type: "error",
                text: error instanceof Error ? error.message : "Error updating appointment.",
            });
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
        { key: "all", label: "All Bookings", status: "all", date: "all" },
        { key: "upcoming", label: "Upcoming", status: "all", date: "upcoming" },
        { key: "past", label: "Past History", status: "all", date: "past" },
        { key: "pending", label: "Pending", status: "pending", date: "all" },
        { key: "confirmed", label: "Confirmed", status: "confirmed", date: "all" },
        { key: "completed", label: "Completed", status: "completed", date: "all" },
        { key: "cancelled", label: "Cancelled", status: "cancelled", date: "all" },
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

    return (
        <>
            <Head title="Appointments — BEZ Hair Studio" />

            <AdminToast toast={toast} onClose={() => setToast(null)} />

            <AdminConfirmModal
                isOpen={confirmModalState.isOpen}
                title={confirmModalState.title}
                message={confirmModalState.message}
                confirmText={confirmModalState.confirmText}
                isDestructive={confirmModalState.isDestructive}
                isLoading={isUpdating}
                onConfirm={confirmModalState.action}
                onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
            />

            <Sidebar>
                <main className="min-h-screen bg-[#f8f7f4]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                        {/* Page Header Card */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                                        Studio Appointments
                                    </h1>
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                        {appointmentList.length} total
                                    </span>
                                </div>
                                <p className="text-sm text-stone-500 mt-1">
                                    Client schedule, service ticket dispatches & payment confirmations
                                </p>
                            </div>

                            <Link
                                href="/booking/step-1"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold tracking-wide transition shadow-sm"
                            >
                                <Plus className="w-4 h-4 text-amber-400" />
                                New Appointment
                            </Link>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                            {/* Search Input */}
                            <div className="relative max-w-xl">
                                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by Confirmation (BZ-XXXXXX), Service Ticket (ST-XXXXXX), Name, Email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-stone-400"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Segmented Filter Pills */}
                            <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-100">
                                {filters.map((filter) => {
                                    const active = isFilterActive(filter);

                                    return (
                                        <button
                                            key={filter.key}
                                            type="button"
                                            onClick={() => handleFilterClick(filter)}
                                            className={`
                                                px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5
                                                ${
                                                    active
                                                        ? "bg-stone-900 text-amber-300 shadow-sm font-semibold border border-stone-800"
                                                        : "bg-stone-100/80 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 border border-transparent"
                                                }
                                            `}
                                        >
                                            <span>{filter.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Appointments Table Card */}
                        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-[1280px] w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-stone-50/75 border-b border-stone-100 text-stone-400 uppercase text-[10px] tracking-wider">
                                            <th className="py-3 px-4 font-semibold">
                                                Booking Code
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Service Ticket
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Client
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Service
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Barber
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Schedule
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Status
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Payment
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Payment Ref
                                            </th>
                                            <th className="py-3 px-4 font-semibold">
                                                Receipt
                                            </th>
                                            <th className="py-3 px-4 font-semibold text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 text-stone-700">
                                        {filteredAppointments.length > 0 ? (
                                            filteredAppointments.map((apt) => {
                                                const confirmationNumber =
                                                    apt.confirmation_number ||
                                                    generateConfirmationNumber(apt.id);
                                                const clientInitials = (apt.client_name || "C")
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase();

                                                return (
                                                    <tr
                                                        key={apt.id}
                                                        className="hover:bg-amber-50/20 transition-colors group"
                                                    >
                                                        {/* Booking Confirmation Code */}
                                                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                                                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                                                                {confirmationNumber}
                                                            </span>
                                                        </td>

                                                        {/* Service Ticket Confirmation */}
                                                        <td className="py-3.5 px-4 font-mono text-stone-700">
                                                            {apt.service_ticket_confirmation_number ? (
                                                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 font-semibold border border-amber-500/20">
                                                                    {apt.service_ticket_confirmation_number}
                                                                </span>
                                                            ) : (
                                                                <span className="text-stone-300 italic text-[11px]">
                                                                    Unissued
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Client Info */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-[10px] border border-stone-200 flex-shrink-0">
                                                                    {clientInitials}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-semibold text-stone-900 truncate">
                                                                        {apt.client_name || "Client"}
                                                                    </div>
                                                                    <div className="text-[11px] text-stone-400 truncate">
                                                                        {apt.email || "No email"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Hairstyle / Service */}
                                                        <td className="py-3.5 px-4 font-medium text-stone-800">
                                                            {apt.hairstyle_name || "Standard Cut"}
                                                        </td>

                                                        {/* Barber */}
                                                        <td className="py-3.5 px-4 text-stone-600">
                                                            {apt.barber_name || "Any Barber"}
                                                        </td>

                                                        {/* Date & Time */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-medium text-stone-900">
                                                                {formatAppointmentDate(apt.appointment_date)}
                                                            </div>
                                                            <div className="text-[11px] text-stone-400">
                                                                {formatAppointmentTime(apt.appointment_time)}
                                                            </div>
                                                        </td>

                                                        {/* Status Badge */}
                                                        <td className="py-3.5 px-4">
                                                            <span
                                                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(
                                                                    apt.status,
                                                                )}`}
                                                            >
                                                                {apt.status}
                                                            </span>
                                                        </td>

                                                        {/* Payment Method & Status */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-medium text-stone-800">
                                                                {getPaymentMethodLabel(apt.payment_method)}
                                                            </div>
                                                            <div className="text-[11px] text-stone-400 capitalize">
                                                                {apt.payment_status || "Unpaid"}
                                                            </div>
                                                        </td>

                                                        {/* Payment ID */}
                                                        <td className="py-3.5 px-4">
                                                            {apt.payment_source_id ? (
                                                                <span className="font-mono text-[11px] text-stone-600 break-all max-w-[130px] inline-block">
                                                                    {apt.payment_source_id}
                                                                </span>
                                                            ) : (
                                                                <span className="text-stone-300">
                                                                    —
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Receipt Preview */}
                                                        <td className="py-3.5 px-4">
                                                            {apt.receipt_image ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openReceiptModal(
                                                                            apt.receipt_image,
                                                                            apt.payment_source_id,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold transition"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    View
                                                                </button>
                                                            ) : (
                                                                <span className="text-stone-300 text-[11px]">
                                                                    None
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Action Buttons */}
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="inline-flex items-center gap-1.5">
                                                                {apt.status === "pending" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            requestConfirmPayment(apt.id)
                                                                        }
                                                                        disabled={isUpdating}
                                                                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                                                        title="Confirm Booking & Issue Service Ticket"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openChangeAppointmentModal(apt)
                                                                    }
                                                                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                                                                    title="Reschedule / Change Details"
                                                                >
                                                                    <CalendarClock className="w-4 h-4" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        requestCancelAppointment(apt.id)
                                                                    }
                                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                                    title="Cancel Appointment"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={11}
                                                    className="py-12 text-center text-stone-400 text-xs"
                                                >
                                                    {searchTerm ? (
                                                        <div>
                                                            <p className="text-stone-600 font-medium">
                                                                No matching appointments found for "{searchTerm}"
                                                            </p>
                                                            <p className="text-stone-400 mt-1">
                                                                Try searching with a different name, email, or confirmation code.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "No appointments in this category."
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer */}
                            <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                                <div>
                                    Showing {filteredAppointments.length} of{" "}
                                    {appointmentList.length} total bookings
                                </div>
                                <div className="text-[11px] text-stone-400 font-medium">
                                    Auto-refreshed live
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </Sidebar>

            {/* Change Appointment Modal */}
            {changeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div>
                                <h3 className="text-base font-bold text-stone-900">
                                    Reschedule Appointment
                                </h3>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    Select new date, time, and assigned barber
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeChangeAppointmentModal}
                                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 my-4">
                            {/* Calendar Month Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                                    Appointment Date
                                </label>
                                <div className="rounded-xl border border-stone-200 p-3 bg-stone-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setChangeAppointmentCalendarMonth(
                                                    new Date(
                                                        changeAppointmentCalendarMonth.getFullYear(),
                                                        changeAppointmentCalendarMonth.getMonth() - 1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-bold text-stone-800">
                                            {MONTHS[changeAppointmentCalendarMonth.getMonth()]}{" "}
                                            {changeAppointmentCalendarMonth.getFullYear()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setChangeAppointmentCalendarMonth(
                                                    new Date(
                                                        changeAppointmentCalendarMonth.getFullYear(),
                                                        changeAppointmentCalendarMonth.getMonth() + 1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-stone-400 mb-1">
                                        {WEEKDAYS.map((d) => (
                                            <span key={d}>{d}</span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {getCalendarDays(changeAppointmentCalendarMonth).map(
                                            (day, idx) => {
                                                const disabled = day.isPast || !day.isCurrentMonth;
                                                const selected = day.isSelected;

                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() => {
                                                            setChangeAppointmentDate(
                                                                toLocalDateString(day.date),
                                                            );
                                                            setChangeAppointmentTime("");
                                                        }}
                                                        className={`
                                                            h-7 rounded-lg text-xs font-medium transition flex items-center justify-center
                                                            ${
                                                                selected
                                                                    ? "bg-amber-500 text-stone-950 font-bold shadow-sm"
                                                                    : day.isToday
                                                                    ? "border border-amber-500 text-amber-600 font-semibold"
                                                                    : day.isCurrentMonth
                                                                    ? "text-stone-700 hover:bg-stone-100"
                                                                    : "text-stone-300 cursor-not-allowed"
                                                            }
                                                        `}
                                                    >
                                                        {day.date.getDate()}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                                <div className="text-[11px] text-stone-500 mt-1.5">
                                    Selected:{" "}
                                    <span className="font-semibold text-stone-800">
                                        {formatDateLabel(changeAppointmentDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Available Time Slots */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-stone-700">
                                        Time Slot
                                    </label>
                                    {isLoadingAvailability && (
                                        <span className="text-[10px] text-amber-600 animate-pulse font-medium">
                                            Loading slots...
                                        </span>
                                    )}
                                </div>

                                {!changeAppointmentDate || !changeAppointmentBarberId ? (
                                    <p className="text-xs text-stone-400 italic">
                                        Select a date and barber to preview open slots.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                                        {ALL_TIME_SLOTS.map((slot) => {
                                            const slotData = changeAppointmentTimeSlots.find(
                                                (item) =>
                                                    item.slot_time.substring(0, 5) === slot,
                                            );
                                            const isExpired = slotData
                                                ? isSlotExpired(
                                                      slotData.slot_date || changeAppointmentDate,
                                                      slotData.slot_time,
                                                    )
                                                : isSlotExpired(changeAppointmentDate, slot);
                                            const isBooked = changeAppointmentBookedTimes.includes(slot);
                                            const isBlocked = !!(
                                                slotData &&
                                                (!slotData.is_available || isExpired)
                                            );
                                            const isAvailable = !isBooked && !isBlocked;
                                            const isSelected = changeAppointmentTime === slot;

                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setChangeAppointmentTime(slot)}
                                                    disabled={isBooked || isExpired || isLoadingAvailability}
                                                    className={`
                                                        py-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center justify-between
                                                        ${
                                                            isSelected
                                                                ? "bg-stone-900 text-amber-400 font-bold shadow-sm"
                                                                : isAvailable
                                                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                                                : "bg-stone-100 text-stone-400 line-through cursor-not-allowed"
                                                        }
                                                    `}
                                                >
                                                    <span>{formatTimeLabel(slot)}</span>
                                                    <span className="text-[10px]">
                                                        {isAvailable ? "✓" : "✕"}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Barber Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                    Assigned Barber
                                </label>
                                <select
                                    value={changeAppointmentBarberId ?? ""}
                                    onChange={(e) => setChangeAppointmentBarberId(Number(e.target.value))}
                                    className="w-full text-xs py-2 px-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                                >
                                    {changeAppointmentBarbers.length > 0 ? (
                                        changeAppointmentBarbers.map((barber) => (
                                            <option key={barber.id} value={barber.id}>
                                                {barber.full_name} {barber.specialty ? `(${barber.specialty})` : ""}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No barbers available</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                            <button
                                type="button"
                                onClick={closeChangeAppointmentModal}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleChangeAppointmentSubmit}
                                disabled={isUpdating}
                                className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-stone-100 hover:bg-stone-800 transition disabled:opacity-50"
                            >
                                {isUpdating ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div>
                                <h3 className="text-base font-bold text-stone-900">
                                    Customer Payment Receipt
                                </h3>
                                {selectedReceipt.paymentSourceId && (
                                    <p className="text-xs text-stone-500 font-mono mt-0.5">
                                        PayMongo ID: {selectedReceipt.paymentSourceId}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={closeReceiptModal}
                                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="my-4 flex justify-center">
                            <img
                                src={selectedReceipt.image}
                                alt="Payment Receipt"
                                className="w-full max-h-[60vh] object-contain rounded-xl border border-stone-200 shadow-sm"
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    img.style.display = "none";
                                    const parent = img.parentElement;
                                    if (parent) {
                                        parent.innerHTML = `
                                            <div class="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                                                <p class="text-xs text-stone-500 font-medium">Receipt image file not found or inaccessible.</p>
                                            </div>
                                        `;
                                    }
                                }}
                            />
                        </div>

                        <div className="flex justify-end pt-2 border-t border-stone-100">
                            <button
                                type="button"
                                onClick={closeReceiptModal}
                                className="px-4 py-2 bg-stone-900 text-stone-100 text-xs font-semibold rounded-xl hover:bg-stone-800 transition"
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
