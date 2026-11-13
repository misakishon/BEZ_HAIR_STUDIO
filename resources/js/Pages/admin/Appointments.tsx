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
                return "bg-[#EDF3EC] text-[#2E5A36] border border-[#D2E0D0]";
            case "pending":
                return "bg-[#FAF3E1] text-[#875B14] border border-[#EADBB8]";
            case "completed":
                return "bg-[#EAE7DF] text-[#252420] border border-[#D5D0C5]";
            case "cancelled":
                return "bg-[#F9ECEC] text-[#8E3535] border border-[#E9CECE]";
            default:
                return "bg-[#F3F1EC] text-[#5C5953] border border-[#E5E2DA]";
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
                <main className="min-h-screen bg-[#F5F4EF] text-[#1C1B18]">
                    <div className="studio-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
                        {/* Page Header Card */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#E5E2DA] pb-6">
                            <div>
                                <span className="font-morche text-[11px] font-semibold uppercase tracking-[0.2em] text-[#918E85]">
                                    Schedule & Tickets
                                </span>
                                <div className="flex items-center gap-3 mt-1">
                                    <h1 className="font-morche text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1B18]">
                                        Studio Appointments
                                    </h1>
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F3F1EC] text-[#3D3B36] border border-[#E5E2DA] tabular-nums">
                                        {appointmentList.length} total
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#737069] mt-1">
                                    Client schedule, service ticket dispatches & payment confirmations
                                </p>
                            </div>

                            <Link
                                href="/booking/step-1"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#252420] hover:bg-[#373530] text-[#FAF9F5] text-xs font-semibold tracking-wide shadow-[0_1px_2px_rgba(28,27,24,0.12)] transition-all duration-150 active:scale-[0.98]"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New Appointment
                            </Link>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="bg-[#FDFCF9] p-5 rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] space-y-4">
                            {/* Search Input */}
                            <div className="relative max-w-xl">
                                <Search className="w-4 h-4 text-[#918E85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by Confirmation (BZ-XXXXXX), Service Ticket (ST-XXXXXX), Name, Email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#F5F4EF] border border-[#E5E2DA] rounded-lg focus:bg-[#FDFCF9] focus:outline-none focus:border-[#252420] focus:ring-0 transition-colors placeholder:text-[#918E85]"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#918E85] hover:text-[#1C1B18] p-1 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Segmented Filter Pills */}
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-[#EFECE5]">
                                {filters.map((filter) => {
                                    const active = isFilterActive(filter);

                                    return (
                                        <button
                                            key={filter.key}
                                            type="button"
                                            onClick={() => handleFilterClick(filter)}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.97] flex items-center gap-1.5 ${
                                                active
                                                    ? "bg-[#252420] text-[#FAF9F5] border border-[#252420]"
                                                    : "bg-[#F3F1EC] text-[#5C5953] hover:bg-[#EAE7DF] hover:text-[#1C1B18] border border-transparent"
                                            }`}
                                        >
                                            <span>{filter.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Appointments Table Card */}
                        <div className="bg-[#FDFCF9] rounded-xl border border-[#E5E2DA] shadow-[0_1px_2px_rgba(28,27,24,0.03)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-[1280px] w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-[#F5F4EF] border-b border-[#E5E2DA] text-[#737069] uppercase text-[10px] tracking-wider">
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
                                    <tbody className="divide-y divide-[#EFECE5] text-[#3D3B36]">
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
                                                        className="hover:bg-[#F5F4EF]/80 transition-colors duration-150 group"
                                                    >
                                                        {/* Booking Confirmation Code */}
                                                        <td className="py-3.5 px-4 font-mono font-bold text-[#1C1B18]">
                                                            <span className="px-2 py-0.5 rounded-md bg-[#F3F1EC] text-[#252420] border border-[#E5E2DA]">
                                                                {confirmationNumber}
                                                            </span>
                                                        </td>

                                                        {/* Service Ticket Confirmation */}
                                                        <td className="py-3.5 px-4 font-mono text-[#252420]">
                                                            {apt.service_ticket_confirmation_number ? (
                                                                <span className="px-2 py-0.5 rounded-md bg-[#252420] text-[#FAF9F5] font-semibold border border-[#33312C]">
                                                                    {apt.service_ticket_confirmation_number}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#BDB7AB] italic text-[11px]">
                                                                    Unissued
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Client Info */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full bg-[#252420] text-[#FAF9F5] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                                                    {clientInitials}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-semibold text-[#1C1B18] truncate">
                                                                        {apt.client_name || "Client"}
                                                                    </div>
                                                                    <div className="text-[11px] text-[#918E85] truncate">
                                                                        {apt.email || "No email"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Hairstyle / Service */}
                                                        <td className="py-3.5 px-4 font-medium text-[#252420]">
                                                            {apt.hairstyle_name || "Standard Cut"}
                                                        </td>

                                                        {/* Barber */}
                                                        <td className="py-3.5 px-4 text-[#5C5953]">
                                                            {apt.barber_name || "Any Barber"}
                                                        </td>

                                                        {/* Date & Time */}
                                                        <td className="py-3.5 px-4 tabular-nums">
                                                            <div className="font-medium text-[#1C1B18]">
                                                                {formatAppointmentDate(apt.appointment_date)}
                                                            </div>
                                                            <div className="text-[11px] text-[#918E85]">
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
                                                            <div className="font-medium text-[#252420]">
                                                                {getPaymentMethodLabel(apt.payment_method)}
                                                            </div>
                                                            <div className="text-[11px] text-[#918E85] capitalize">
                                                                {apt.payment_status || "Unpaid"}
                                                            </div>
                                                        </td>

                                                        {/* Payment ID */}
                                                        <td className="py-3.5 px-4">
                                                            {apt.payment_source_id ? (
                                                                <span className="font-mono text-[11px] text-[#5C5953] break-all max-w-[130px] inline-block">
                                                                    {apt.payment_source_id}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#C7C3B9]">
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
                                                                    className="inline-flex items-center gap-1 text-[#252420] hover:text-[#1C1B18] font-semibold underline underline-offset-4 transition-opacity hover:opacity-75"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    View
                                                                </button>
                                                            ) : (
                                                                <span className="text-[#C7C3B9] text-[11px]">
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
                                                                        className="p-1.5 rounded-lg text-[#2E5A36] hover:bg-[#EDF3EC] transition-all duration-150 active:scale-95"
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
                                                                    className="p-1.5 rounded-lg text-[#737069] hover:text-[#1C1B18] hover:bg-[#EFECE5] transition-all duration-150 active:scale-95"
                                                                    title="Reschedule / Change Details"
                                                                >
                                                                    <CalendarClock className="w-4 h-4" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        requestCancelAppointment(apt.id)
                                                                    }
                                                                    className="p-1.5 rounded-lg text-[#918E85] hover:text-[#8E3535] hover:bg-[#F9ECEC] transition-all duration-150 active:scale-95"
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
                                                    className="py-12 text-center text-[#918E85] text-xs"
                                                >
                                                    {searchTerm ? (
                                                        <div>
                                                            <p className="text-[#5C5953] font-medium">
                                                                No matching appointments found for "{searchTerm}"
                                                            </p>
                                                            <p className="text-[#918E85] mt-1">
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
                            <div className="p-4 border-t border-[#EFECE5] flex items-center justify-between text-xs text-[#918E85]">
                                <div>
                                    Showing {filteredAppointments.length} of{" "}
                                    {appointmentList.length} total bookings
                                </div>
                                <div className="text-[11px] text-[#918E85] font-medium">
                                    Auto-refreshed live
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </Sidebar>

            {/* Change Appointment Modal */}
            {changeModalOpen && (
                <div className="studio-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/40 backdrop-blur-[2px]">
                    <div
                        className="studio-modal-panel bg-[#FDFCF9] rounded-2xl max-w-lg w-full p-6 shadow-[0_16px_40px_rgba(28,27,24,0.16)] border border-[#E5E2DA] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#EFECE5]">
                            <div>
                                <h3 className="text-base font-bold text-[#1C1B18]">
                                    Reschedule Appointment
                                </h3>
                                <p className="text-xs text-[#918E85] mt-0.5">
                                    Select new date, time, and assigned barber
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeChangeAppointmentModal}
                                className="text-[#807D75] hover:text-[#1C1B18] p-1 rounded-lg hover:bg-[#EFECE5] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 my-4">
                            {/* Calendar Month Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-[#3D3B36] mb-1.5">
                                    Appointment Date
                                </label>
                                <div className="rounded-xl border border-[#E5E2DA] p-3 bg-[#F5F4EF]">
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
                                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#EAE7DF] text-[#5C5953] transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-bold text-[#1C1B18]">
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
                                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#EAE7DF] text-[#5C5953] transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#918E85] mb-1">
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
                                                            h-7 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center active:scale-[0.96]
                                                            ${
                                                                selected
                                                                    ? "bg-[#252420] text-[#FAF9F5] font-semibold shadow-sm"
                                                                    : day.isToday
                                                                    ? "border border-[#252420] text-[#1C1B18] font-semibold"
                                                                    : day.isCurrentMonth
                                                                    ? "text-[#4D4B45] hover:bg-[#EFECE5]"
                                                                    : "text-[#D1CDC4] cursor-not-allowed"
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
                                <div className="text-[11px] text-[#737069] mt-1.5">
                                    Selected:{" "}
                                    <span className="font-semibold text-[#1C1B18]">
                                        {formatDateLabel(changeAppointmentDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Available Time Slots */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-[#4D4B45]">
                                        Time Slot
                                    </label>
                                    {isLoadingAvailability && (
                                        <span className="text-[10px] text-[#737069] animate-pulse font-medium">
                                            Loading slots...
                                        </span>
                                    )}
                                </div>

                                {!changeAppointmentDate || !changeAppointmentBarberId ? (
                                    <p className="text-xs text-[#918E85] italic">
                                        Select a date and barber to preview open slots.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1 studio-scrollbar">
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
                                                        py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-between active:scale-[0.97]
                                                        ${
                                                            isSelected
                                                                ? "bg-[#252420] text-[#FAF9F5] font-semibold shadow-sm"
                                                                : isAvailable
                                                                ? "bg-[#FDFCF9] text-[#1C1B18] border border-[#E5E2DA] hover:border-[#252420] hover:bg-[#FAF9F5]"
                                                                : "bg-[#F5F4EF] text-[#B5B1A8] line-through cursor-not-allowed"
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
                                <label className="block text-xs font-semibold text-[#4D4B45] mb-1">
                                    Assigned Barber
                                </label>
                                <select
                                    value={changeAppointmentBarberId ?? ""}
                                    onChange={(e) => setChangeAppointmentBarberId(Number(e.target.value))}
                                    className="w-full text-xs py-2 px-3 bg-[#FDFCF9] border border-[#E5E2DA] rounded-xl focus:outline-none focus:border-[#252420] focus:ring-0 text-[#1C1B18] transition-colors duration-200"
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
                        <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E2DA]">
                            <button
                                type="button"
                                onClick={closeChangeAppointmentModal}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#737069] hover:text-[#1C1B18] hover:bg-[#EFECE5] transition-all duration-150 active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleChangeAppointmentSubmit}
                                disabled={isUpdating}
                                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#252420] text-[#FAF9F5] hover:bg-[#3A3832] transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isUpdating ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="studio-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/45 backdrop-blur-[2px]">
                    <div
                        className="studio-modal-panel bg-[#FDFCF9] rounded-2xl max-w-xl w-full p-6 shadow-[0_16px_40px_rgba(28,27,24,0.18)] border border-[#E5E2DA] relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#EFECE5]">
                            <div>
                                <h3 className="text-base font-bold text-[#1C1B18]">
                                    Customer Payment Receipt
                                </h3>
                                {selectedReceipt.paymentSourceId && (
                                    <p className="text-xs text-[#737069] font-mono mt-0.5">
                                        PayMongo ID: {selectedReceipt.paymentSourceId}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={closeReceiptModal}
                                className="text-[#807D75] hover:text-[#1C1B18] p-1 rounded-lg hover:bg-[#EFECE5] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="my-4 flex justify-center">
                            <img
                                src={selectedReceipt.image}
                                alt="Payment Receipt"
                                className="w-full max-h-[60vh] object-contain rounded-xl border border-[#E5E2DA]"
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    img.style.display = "none";
                                    const parent = img.parentElement;
                                    if (parent) {
                                        parent.innerHTML = `
                                            <div class="p-8 text-center bg-[#F5F4EF] rounded-xl border border-dashed border-[#D5D0C5]">
                                                <p class="text-xs text-[#737069] font-medium">Receipt image file not found or inaccessible.</p>
                                            </div>
                                        `;
                                    }
                                }}
                            />
                        </div>

                        <div className="flex justify-end pt-2 border-t border-[#EFECE5]">
                            <button
                                type="button"
                                onClick={closeReceiptModal}
                                className="px-4 py-2 bg-[#252420] text-[#FAF9F5] text-xs font-semibold rounded-xl hover:bg-[#373530] transition-all duration-150 active:scale-[0.98]"
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
