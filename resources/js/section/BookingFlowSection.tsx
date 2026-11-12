import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    Scissors,
    Calendar,
    Clock,
    Sparkles,
    UserCheck,
    CreditCard,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Bell,
    Zap,
    ChevronRight,
    Star,
    Check,
} from "lucide-react";

interface StepData {
    step: number;
    badge: string;
    title: string;
    shortTitle: string;
    duration: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    perks: string[];
    preview: {
        headline: string;
        subheadline: string;
        details: Array<{ label: string; value: string }>;
        badgeText: string;
    };
}

const stepsData: StepData[] = [
    {
        step: 1,
        badge: "Step 01",
        title: "Choose Your Barber",
        shortTitle: "Select Stylist",
        duration: "30 sec",
        description:
            "Select your favorite master barber based on specialties and verified reviews, or select 'Any Available' for the fastest open chair.",
        icon: Scissors,
        perks: [
            "View barber specialties & ratings",
            "Option for fastest chair availability",
            "Consistent, personalized styling",
        ],
        preview: {
            headline: "Barber Selection",
            subheadline: "Selected Master Barber",
            details: [
                { label: "Stylist", value: "Senior Master Barber" },
                { label: "Rating", value: "4.9 ★ (120+ reviews)" },
                { label: "Experience", value: "5+ Years Craft" },
                { label: "Status", value: "Available Today" },
            ],
            badgeText: "Chair Reserved",
        },
    },
    {
        step: 2,
        badge: "Step 02",
        title: "Select Date & Time",
        shortTitle: "Pick Time Slot",
        duration: "45 sec",
        description:
            "Browse our live studio calendar and pick an available 30-minute time slot between 9:00 AM and 7:00 PM with real-time slot synchronization.",
        icon: Calendar,
        perks: [
            "Real-time synchronized availability",
            "Convenient 30-minute intervals",
            "Zero double-booking guarantee",
        ],
        preview: {
            headline: "Schedule Window",
            subheadline: "Real-Time Appointment Slot",
            details: [
                { label: "Selected Date", value: "Tuesday, Oct 24" },
                { label: "Time Slot", value: "10:30 AM — 11:00 AM" },
                { label: "Buffer Window", value: "Zero Waiting Queue" },
                { label: "Calendar Sync", value: "Live Synced" },
            ],
            badgeText: "Slot Locked",
        },
    },
    {
        step: 3,
        badge: "Step 03",
        title: "Pick Style & Your Details",
        shortTitle: "Style & Info",
        duration: "30 sec",
        description:
            "Choose your signature haircut or grooming service and input your contact details so we can deliver automated SMS and email notifications.",
        icon: Sparkles,
        perks: [
            "Signature fades, tapers & styling",
            "Transparent pricing & service times",
            "Automated booking reminder alerts",
        ],
        preview: {
            headline: "Service & Profile",
            subheadline: "Custom Haircut Profile",
            details: [
                { label: "Signature Cut", value: "High Taper Fade" },
                { label: "Duration", value: "30 Minutes" },
                { label: "Guest Name", value: "Alex Mendoza" },
                { label: "Notifications", value: "SMS & Email Active" },
            ],
            badgeText: "Details Validated",
        },
    },
    {
        step: 4,
        badge: "Step 04",
        title: "Confirm & Flexible Payment",
        shortTitle: "Easy Checkout",
        duration: "15 sec",
        description:
            "Review your booking summary and choose how to pay: instant cashless checkout with GCash QR or convenient Cash payment upon your visit.",
        icon: CreditCard,
        perks: [
            "Seamless GCash digital payment",
            "Cash in studio option accepted",
            "Instant digital booking receipt",
        ],
        preview: {
            headline: "Booking Confirmation",
            subheadline: "Verified Reservation",
            details: [
                { label: "Payment Choice", value: "GCash or Cash on Arrival" },
                { label: "Booking Ref", value: "#BEZ-89421" },
                { label: "Reschedule Policy", value: "Flexible & Free" },
                { label: "Studio Location", value: "Bangui, Ilocos Norte" },
            ],
            badgeText: "Ready for Your Cut",
        },
    },
];

const guarantees = [
    {
        icon: Zap,
        title: "Under 2 Minutes",
        description: "Fast, frictionless booking without sign-up friction.",
    },
    {
        icon: Clock,
        title: "Zero Waiting Time",
        description: "Your chair is pre-reserved exactly for your chosen slot.",
    },
    {
        icon: Bell,
        title: "Smart Reminders",
        description: "Instant SMS and email reminders with one-click directions.",
    },
    {
        icon: ShieldCheck,
        title: "Free Rescheduling",
        description: "Plans change? Easily adjust or reschedule ahead of time.",
    },
];

export default function BookingFlowSection() {
    const [activeStep, setActiveStep] = useState<number>(1);
    const currentStepData = stepsData.find((s) => s.step === activeStep) ?? stepsData[0];
    const ActiveIcon = currentStepData.icon;

    return (
        <section
            id="how-it-works"
            className="relative overflow-hidden border-t border-neutral-200 bg-white py-20 sm:py-28"
        >
            <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
                    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-100 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-black shadow-xs mb-4">
                        <Sparkles className="h-3.5 w-3.5 text-black" />
                        <span>The Booking Process</span>
                    </div>

                    <h2 className="font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl leading-tight">
                        How booking works in{" "}
                        <span className="font-normal italic text-black">
                            four simple steps
                        </span>
                        .
                    </h2>

                    <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
                        We have eliminated long barbershop queues. Pick your barber, choose a time that fits your day, and walk straight into your chair.
                    </p>

                    {/* Step progress pills for quick mobile/tablet switching */}
                    <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1.5 shadow-xs">
                        {stepsData.map((s) => {
                            const isCurrent = s.step === activeStep;
                            return (
                                <button
                                    key={s.step}
                                    type="button"
                                    onClick={() => setActiveStep(s.step)}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                                        isCurrent
                                            ? "bg-black text-white shadow-xs"
                                            : "text-neutral-600 hover:text-black hover:bg-neutral-200"
                                    }`}
                                >
                                    <span
                                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                                            isCurrent
                                                ? "bg-white text-black"
                                                : "bg-neutral-200 text-neutral-700"
                                        }`}
                                    >
                                        {s.step}
                                    </span>
                                    <span>{s.shortTitle}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop Stepper Connecting Bar */}
                <div className="hidden lg:block mb-12">
                    <div className="relative flex items-center justify-between">
                        {/* Connecting line */}
                        <div
                            aria-hidden="true"
                            className="absolute left-10 right-10 top-5 h-[2px] bg-neutral-200"
                        >
                            <div
                                className="h-full bg-black transition-all duration-500"
                                style={{
                                    width: `${((activeStep - 1) / 3) * 100}%`,
                                }}
                            />
                        </div>

                        {stepsData.map((s) => {
                            const isPassed = s.step < activeStep;
                            const isCurrent = s.step === activeStep;

                            return (
                                <button
                                    key={s.step}
                                    type="button"
                                    onClick={() => setActiveStep(s.step)}
                                    className="group relative z-10 flex flex-col items-center focus:outline-none"
                                >
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                            isCurrent
                                                ? "bg-black text-white ring-4 ring-neutral-200 scale-110 shadow-md"
                                                : isPassed
                                                  ? "bg-black text-white shadow-xs"
                                                  : "border-2 border-neutral-300 bg-white text-neutral-600 group-hover:border-black"
                                        }`}
                                    >
                                        {isPassed ? (
                                            <Check className="h-4 w-4 stroke-[3]" />
                                        ) : (
                                            `0${s.step}`
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-medium tracking-wide transition-colors ${
                                            isCurrent
                                                ? "font-semibold text-black"
                                                : "text-neutral-500 group-hover:text-black"
                                        }`}
                                    >
                                        {s.shortTitle}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4 Cards Grid with interactive preview and smooth hover */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-12 sm:mb-16">
                    {stepsData.map((s) => {
                        const Icon = s.icon;
                        const isSelected = s.step === activeStep;

                        return (
                            <div
                                key={s.step}
                                onClick={() => setActiveStep(s.step)}
                                className={`group relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 text-left transition-all duration-300 cursor-pointer ${
                                    isSelected
                                        ? "bg-white border-2 border-black shadow-lg -translate-y-1.5"
                                        : "bg-white border border-neutral-200 shadow-xs hover:border-black hover:shadow-md hover:-translate-y-1"
                                }`}
                            >
                                {/* Top Badge & Icon */}
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-5">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${
                                                isSelected
                                                    ? "bg-black text-white shadow-xs"
                                                    : "bg-neutral-100 border border-neutral-200 text-black group-hover:bg-neutral-200"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${
                                                    isSelected
                                                        ? "bg-black text-white"
                                                        : "bg-neutral-100 text-neutral-600"
                                                }`}
                                            >
                                                {s.badge}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Titles */}
                                    <h3 className="font-serif text-xl font-medium tracking-tight text-neutral-950 mb-2">
                                        {s.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                                        {s.description}
                                    </p>
                                </div>

                                {/* Checklist perks */}
                                <div className="space-y-2.5 border-t border-neutral-100 pt-5">
                                    {s.perks.map((perk, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-2 text-xs text-neutral-700"
                                        >
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                                                    isSelected
                                                        ? "text-black"
                                                        : "text-neutral-400 group-hover:text-black"
                                                }`}
                                            />
                                            <span>{perk}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Active step indicator bar at bottom of card */}
                                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                                    <span className="text-neutral-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-neutral-400" />
                                        Avg: {s.duration}
                                    </span>
                                    <span
                                        className={`font-semibold transition-colors flex items-center gap-1 ${
                                            isSelected
                                                ? "text-black"
                                                : "text-neutral-400 group-hover:text-black"
                                        }`}
                                    >
                                        {isSelected ? "Active View" : "Click to view"}
                                        <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Interactive Live Step Preview Card */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left column: Step breakdown details */}
                        <div className="lg:col-span-7 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-black border border-neutral-200">
                                    <ActiveIcon className="w-3.5 h-3.5 text-black" />
                                    {currentStepData.badge} Live Simulator
                                </span>
                                <span className="text-xs text-neutral-500">
                                    • Interactive Walkthrough
                                </span>
                            </div>

                            <h3 className="font-serif text-2xl sm:text-3xl text-neutral-950 font-medium tracking-tight mb-3">
                                {currentStepData.title}
                            </h3>

                            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
                                {currentStepData.description}
                            </p>

                            {/* Bullet points summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                {currentStepData.perks.map((perk, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2.5 rounded-xl bg-neutral-50 border border-neutral-200 p-3 text-xs sm:text-sm text-neutral-800"
                                    >
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-black">
                                            <Check className="h-3 w-3 stroke-[3]" />
                                        </div>
                                        <span className="font-medium">{perk}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Direct Action Link */}
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href="/booking/step-1"
                                    className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:gap-3"
                                >
                                    <span>Experience Booking Now</span>
                                    <ArrowRight className="h-4 w-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
                                </Link>

                                <span className="text-xs text-neutral-500 px-2">
                                    Instant confirmation • No pre-payment required
                                </span>
                            </div>
                        </div>

                        {/* Right column: Realistic Studio Mockup Card */}
                        <div className="lg:col-span-5">
                            <div className="relative mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 shadow-sm">
                                {/* Top bar of simulator */}
                                <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-4">
                                    <div>
                                        <div className="text-xs font-bold text-neutral-950 tracking-wider">
                                            BEZ STUDIO
                                        </div>
                                        <div className="text-[10px] text-neutral-500">
                                            Bangui, Ilocos Norte
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-black text-white px-2.5 py-0.5 text-[10px] font-semibold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                        {currentStepData.preview.badgeText}
                                    </span>
                                </div>

                                {/* Mockup content */}
                                <div className="space-y-3.5">
                                    <div className="rounded-xl bg-white p-3.5 border border-neutral-200 shadow-2xs">
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                                            {currentStepData.preview.headline}
                                        </div>
                                        <div className="font-serif text-base font-semibold text-neutral-950">
                                            {currentStepData.preview.subheadline}
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 border border-neutral-200 shadow-2xs space-y-2.5">
                                        {currentStepData.preview.details.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 last:border-none"
                                            >
                                                <span className="text-neutral-500 font-medium">
                                                    {item.label}
                                                </span>
                                                <span className="font-semibold text-neutral-900">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mockup footer reassurance */}
                                <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-200 text-[11px] text-neutral-500">
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck className="h-3.5 w-3.5 text-black" />
                                        Verified System
                                    </span>
                                    <span>Encrypted & Protected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4 Trust & Guarantee Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
                    {guarantees.map((item, idx) => {
                        const GIcon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-black transition-all duration-200"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 border border-neutral-200 text-black">
                                    <GIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xs sm:text-sm text-neutral-950">
                                        {item.title}
                                    </h4>
                                    <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed mt-0.5">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-black px-6 py-10 sm:px-12 sm:py-14 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div className="max-w-xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-white mb-3">
                                <Sparkles className="h-3 w-3" />
                                Instant Booking Available
                            </span>
                            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-white leading-tight">
                                Ready to look sharp? <br className="hidden sm:inline" />
                                Reserve your chair in seconds.
                            </h3>
                            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                                Avoid the wait. Choose your preferred barber and schedule a time that fits your day perfectly.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                            <Link
                                href="/booking/step-1"
                                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-black transition-all hover:bg-neutral-200 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Book Appointment
                                <ArrowRight
                                    aria-hidden="true"
                                    className="h-4 w-4 text-black transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </Link>

                            <a
                                href="/#haircut"
                                onClick={(e) => {
                                    const haircut = document.getElementById("haircut");
                                    if (haircut) {
                                        e.preventDefault();
                                        haircut.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                    }
                                }}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-6 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-400 hover:bg-neutral-800"
                            >
                                View Haircuts
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
