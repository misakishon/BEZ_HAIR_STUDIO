import React, { useCallback, useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Header from "../components/header";
import StepIndicator from "../booking/stepservice";

interface Hairstyle {
    id: number;
    name: string;
    price: number | string;
    duration_minutes: number;
}

interface Barber {
    id: number;
    full_name: string;
    specialty: string | null;
}

interface BookingStep3Props {
    hairstyle: Hairstyle | null;
    barber: Barber | null;
    barberId: number;
    hairstyleId: number | null;
}

// Updated time slots: 9:00 AM to 7:00 PM in 30-minute increments
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

const to12Hour = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

export default function BookingStep3({
    hairstyle,
    barber,
    barberId,
    hairstyleId,
}: BookingStep3Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
    const [unavailableSlots, setUnavailableSlots] = useState<Set<string>>(
        new Set(),
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const REFRESH_INTERVAL_MS = 5000;

    useEffect(() => {
        const savedDate = sessionStorage.getItem("booking_date");
        const savedTime = sessionStorage.getItem("booking_time");

        if (savedDate) {
            const [y, m, d] = savedDate.split("-").map(Number);
            setCurrentDate(new Date(y, m - 1, 1));
            setSelectedDate(new Date(y, m - 1, d));
        } else {
            setSelectedDate(new Date());
        }

        if (savedTime) setSelectedTime(savedTime);
    }, []);

    const loadAvailableSlots = useCallback(async () => {
        if (!selectedDate) return;
        setErrorMessage(null);
        setIsLoading(true);

        const dateStr = toLocalDateString(selectedDate);

        try {
            const response = await fetch(
                `/booking/get-slots?date=${dateStr}&barber_id=${barberId}`,
            );

            if (!response.ok) {
                throw new Error(
                    `Availability request failed (${response.status})`,
                );
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || "Unable to load availability.");
            }

            const nextBookedSlots = new Set<string>(data.booked_times || []);
            const nextUnavailableSlots = new Set<string>(
                data.unavailable_times || [],
            );

            setBookedSlots(nextBookedSlots);
            setUnavailableSlots(nextUnavailableSlots);
            setSelectedTime((currentTime) => {
                if (!currentTime) return currentTime;
                return nextBookedSlots.has(currentTime) ||
                    nextUnavailableSlots.has(currentTime)
                    ? null
                    : currentTime;
            });
        } catch (error) {
            console.error("Failed to load slots:", error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to load available times.",
            );
            setBookedSlots(new Set());
            setUnavailableSlots(new Set());
        } finally {
            setIsLoading(false);
        }
    }, [barberId, selectedDate]);

    useEffect(() => {
        if (selectedDate) {
            void loadAvailableSlots();
        }
    }, [selectedDate, loadAvailableSlots]);

    useEffect(() => {
        if (!selectedDate) return;

        const intervalId = window.setInterval(() => {
            void loadAvailableSlots();
        }, REFRESH_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [selectedDate, loadAvailableSlots]);

    const toLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        sessionStorage.setItem("booking_date", toLocalDateString(date));
        sessionStorage.removeItem("booking_time");
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        sessionStorage.setItem("booking_time", time);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!selectedDate || !selectedTime) {
            setErrorMessage("Please choose a date and time before continuing.");
            return;
        }

        setIsSubmitting(true);

        const dateStr = toLocalDateString(selectedDate);

        sessionStorage.setItem("booking_date", dateStr);
        sessionStorage.setItem("booking_time", selectedTime);
        if (hairstyleId) {
            sessionStorage.setItem("selectedHairstyleId", String(hairstyleId));
        } else {
            sessionStorage.removeItem("selectedHairstyleId");
        }

        const params: Record<string, any> = {
            barber_id: barberId,
            date: dateStr,
            time: selectedTime,
        };

        if (hairstyleId) {
            params.hairstyle_id = hairstyleId;
        }

        const url = `/booking/step-3?barber_id=${barberId}${
            hairstyleId ? `&hairstyle_id=${hairstyleId}` : ""
        }&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(
            selectedTime,
        )}`;

        router.get("/booking/step-3", params, {
            preserveState: false,
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
                setErrorMessage(
                    "Unable to continue to the next step. Please try again.",
                );
                setIsSubmitting(false);
                window.location.href = url;
            },
        });
    };

    const getDaysInMonth = (year: number, month: number) =>
        new Date(year, month + 1, 0).getDate();

    const getFirstDayOfMonth = (year: number, month: number) =>
        new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDay = getFirstDayOfMonth(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);

        const calendarDays: React.ReactNode[] = [];

        // Previous month filler days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            calendarDays.push(
                <div
                    key={`prev-${day}`}
                    style={{
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        color: "#d1d5db",
                    }}
                >
                    {day}
                </div>,
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isPast = date < today;
            const isToday = date.toDateString() === today.toDateString();
            const isSelected =
                selectedDate !== null &&
                date.toDateString() === selectedDate.toDateString();

            let btnStyle: React.CSSProperties = {
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                fontSize: "13px",
                fontWeight: 500,
                cursor: isPast ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                color: "#374151",
            };

            if (isPast) {
                btnStyle.color = "#d1d5db";
            } else if (isSelected) {
                btnStyle.background = "#d97706";
                btnStyle.color = "#fff";
            } else if (isToday) {
                btnStyle.border = "2px solid #d97706";
                btnStyle.color = "#d97706";
            }

            calendarDays.push(
                <div
                    key={day}
                    style={{
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <button
                        onClick={() => !isPast && handleDateSelect(date)}
                        disabled={isPast}
                        style={btnStyle}
                        onMouseEnter={(e) => {
                            if (!isPast && !isSelected) {
                                (
                                    e.currentTarget as HTMLButtonElement
                                ).style.background = "#f3f4f6";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isPast && !isSelected) {
                                (
                                    e.currentTarget as HTMLButtonElement
                                ).style.background = "transparent";
                            }
                        }}
                    >
                        {day}
                    </button>
                </div>,
            );
        }

        // Next month filler days
        const totalCells = 42;
        const remaining = totalCells - calendarDays.length;
        for (let day = 1; day <= remaining; day++) {
            calendarDays.push(
                <div
                    key={`next-${day}`}
                    style={{
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        color: "#d1d5db",
                    }}
                >
                    {day}
                </div>,
            );
        }

        return calendarDays;
    };

    const goToPrevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        );
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const goToNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        );
        setSelectedDate(null);
        setSelectedTime(null);
    };

    // Group time slots by AM/PM for better display
    const getTimeSlotsByPeriod = () => {
        const morning: string[] = [];
        const afternoon: string[] = [];
        const evening: string[] = [];

        ALL_TIME_SLOTS.forEach((slot) => {
            const hour = parseInt(slot.split(":")[0]);
            if (hour < 12) {
                morning.push(slot);
            } else if (hour < 17) {
                afternoon.push(slot);
            } else {
                evening.push(slot);
            }
        });

        return { morning, afternoon, evening };
    };

    const { morning, afternoon, evening } = getTimeSlotsByPeriod();

    const renderTimeSlotGroup = (slots: string[], label: string) => {
        if (slots.length === 0) return null;

        return (
            <div className="mb-4 last:mb-0">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                    {label}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                        const isBooked = bookedSlots.has(slot);
                        const isUnavailable = unavailableSlots.has(slot);
                        const now = new Date();
                        const isToday =
                            selectedDate !== null &&
                            selectedDate.toDateString() === now.toDateString();
                        const [hour, minute] = slot.split(":").map(Number);
                        const slotDate = new Date(
                            selectedDate?.getFullYear() ?? now.getFullYear(),
                            selectedDate?.getMonth() ?? now.getMonth(),
                            selectedDate?.getDate() ?? now.getDate(),
                            hour,
                            minute,
                        );
                        const isPastRealtime = isToday && slotDate < now;
                        const isDisabled =
                            isBooked || isUnavailable || isPastRealtime;
                        const label = isUnavailable
                            ? "Booked"
                            : isBooked
                              ? "Booked"
                              : isPastRealtime
                                ? "Passed"
                                : "";
                        const isSelected = selectedTime === slot;

                        return (
                            <button
                                key={slot}
                                onClick={() =>
                                    !isDisabled && handleTimeSelect(slot)
                                }
                                disabled={isDisabled}
                                className={`
                                    py-2.5 px-1 text-xs font-medium rounded-lg border transition-all duration-200 text-center
                                    ${
                                        isDisabled
                                            ? "bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed"
                                            : isSelected
                                              ? "bg-black border-black text-white shadow-md scale-105"
                                              : "bg-white border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50 hover:scale-105 cursor-pointer"
                                    }
                                `}
                            >
                                {to12Hour(slot)}
                                {label ? ` · ${label}` : ""}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Date & Time — BEZ Hair Studio" />
            <Header />

            <main className="min-h-screen bg-[#faf9f6] pb-12">
                <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
                    <StepIndicator currentStep={2} />

                    {/* Booking Summary Bar */}
                    {(hairstyle || barber || barberId === 0) && (
                        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap gap-6 justify-between items-center">
                                {hairstyle && (
                                    <div>
                                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                                            Selected Service
                                        </span>
                                        <p className="mt-1 font-semibold text-neutral-950">
                                            {hairstyle.name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {hairstyle.duration_minutes} min · ₱
                                            {Number(
                                                hairstyle.price ?? 0,
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                                {barber ? (
                                    <div>
                                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                                            Barber
                                        </span>
                                        <p className="mt-1 font-semibold text-neutral-950">
                                            {barber.full_name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {barber.specialty ||
                                                "Master Barber"}
                                        </p>
                                    </div>
                                ) : (
                                    barberId === 0 && (
                                        <div>
                                            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                                                Barber
                                            </span>
                                            <p className="mt-1 font-semibold text-neutral-950">
                                                Any Available Barber
                                            </p>
                                        </div>
                                    )
                                )}
                                <Link
                                    href="/booking/step-1"
                                    className="rounded-full px-3 py-2 text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:bg-neutral-50 hover:text-neutral-950 hover:underline"
                                >
                                    Change
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Side by Side Layout */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* ── CALENDAR SECTION ── */}
                        <div>
                            <h2 className="mb-3 text-sm font-semibold text-neutral-950">
                                Select Date
                            </h2>

                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e5e5e5",
                                    borderRadius: "20px",
                                    padding: "clamp(16px, 4vw, 24px)",
                                    boxShadow: "0 8px 24px rgba(23,23,23,0.04)",
                                }}
                            >
                                {/* Month Navigation */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "16px",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={goToPrevMonth}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            border: "1px solid #e5e7eb",
                                            background: "#fff",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        ←
                                    </button>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "15px",
                                            color: "#111827",
                                        }}
                                    >
                                        {MONTHS[currentDate.getMonth()]}{" "}
                                        {currentDate.getFullYear()}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={goToNextMonth}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            border: "1px solid #e5e7eb",
                                            background: "#fff",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        →
                                    </button>
                                </div>

                                {/* Weekday Headers */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(7, 1fr)",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {WEEKDAYS.map((day) => (
                                        <div
                                            key={day}
                                            style={{
                                                textAlign: "center",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                                color: "#9ca3af",
                                                padding: "6px 0",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(7, 1fr)",
                                    }}
                                >
                                    {renderCalendar()}
                                </div>

                                {/* Operating Hours Note */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <p className="text-[10px] text-gray-400 text-center">
                                        Operating Hours: 9:00 AM — 7:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── TIME SLOTS SECTION ── */}
                        <div>
                            <h2 className="mb-3 text-sm font-semibold text-neutral-950">
                                Available Times
                                {selectedDate && (
                                    <span className="ml-1 font-normal text-neutral-500">
                                        · {MONTHS[selectedDate.getMonth()]}{" "}
                                        {selectedDate.getDate()},{" "}
                                        {selectedDate.getFullYear()}
                                    </span>
                                )}
                            </h2>

                            {isLoading && (
                                <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white py-12">
                                    <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
                                    <span className="text-sm text-neutral-500">
                                        Checking availability…
                                    </span>
                                </div>
                            )}

                            {!isLoading && !selectedDate && (
                                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-12 text-center">
                                    <div className="text-5xl mb-3">📅</div>
                                    <p className="text-sm text-neutral-500">
                                        Select a date to see available times
                                    </p>
                                </div>
                            )}

                            {!isLoading && errorMessage && (
                                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center text-red-700">
                                    <p className="text-sm">{errorMessage}</p>
                                </div>
                            )}

                            {!isLoading && selectedDate && !errorMessage && (
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e5e5e5",
                                        borderRadius: "20px",
                                        padding: "clamp(16px, 4vw, 24px)",
                                        boxShadow: "0 8px 24px rgba(23,23,23,0.04)",
                                    }}
                                >
                                    {/* Morning Slots */}
                                    {renderTimeSlotGroup(morning, "Morning")}

                                    {/* Afternoon Slots */}
                                    {renderTimeSlotGroup(
                                        afternoon,
                                        "Afternoon",
                                    )}

                                    {/* Evening Slots */}
                                    {renderTimeSlotGroup(evening, "Evening")}

                                    {/* Legend */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "16px",
                                            marginTop: "16px",
                                            paddingTop: "16px",
                                            borderTop: "1px solid #f3f4f6",
                                        }}
                                    >
                                        {[
                                            {
                                                bg: "#000",
                                                label: "Selected",
                                                textColor: "#fff",
                                            },
                                            {
                                                bg: "#f3f4f6",
                                                label: "Unavailable",
                                                border: "#e5e7eb",
                                                textColor: "#9ca3af",
                                            },
                                            {
                                                bg: "#fff",
                                                label: "Available",
                                                border: "#d1d5db",
                                                textColor: "#374151",
                                            },
                                        ].map(
                                            ({
                                                bg,
                                                label,
                                                border,
                                                textColor,
                                            }) => (
                                                <div
                                                    key={label}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: "14px",
                                                            height: "14px",
                                                            background: bg,
                                                            border: border
                                                                ? `1px solid ${border}`
                                                                : "none",
                                                            borderRadius: "3px",
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: "10px",
                                                            color: "#9ca3af",
                                                        }}
                                                    >
                                                        {label}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-5"
                    >
                        <Link
                            href="/booking/step-1"
                            className="rounded-full border border-neutral-300 px-5 py-3 text-sm text-neutral-700 transition-colors hover:border-neutral-500 hover:bg-white"
                        >
                            ← Back
                        </Link>
                        <button
                            type="submit"
                            disabled={
                                !selectedDate || !selectedTime || isSubmitting
                            }
                            className={`
                                rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors
                                ${
                                    !selectedDate ||
                                    !selectedTime ||
                                    isSubmitting
                                        ? "cursor-not-allowed opacity-40"
                                        : "hover:bg-neutral-800"
                                }
                            `}
                        >
                            {isSubmitting
                                ? "Loading..."
                                : "Continue to Contact →"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
