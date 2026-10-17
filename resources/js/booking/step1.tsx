import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import Header from "../components/header";
import StepIndicator from "../booking/stepservice";
const profileImage = "/uploads/barbers/defaultBarber.jpg";
import { resolveUploadImageUrl } from "../utils/imageUrls";

interface Barber {
    id: number;
    full_name: string;
    specialty: string | null;
    rating: number | string;
    total_reviews: number;
    experience_years: number;
    profile_image: string | null;
    is_available: number;
}

interface BookingStep1Props {
    barbers?: Barber[];
}

export default function BookingStep1({ barbers = [] }: BookingStep1Props) {
    const [selectedBarberId, setSelectedBarberId] = useState<number | null>(
        null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load saved selection from sessionStorage on mount
    useEffect(() => {
        const savedBarberId = sessionStorage.getItem("selectedBarberId");
        if (savedBarberId !== null && savedBarberId !== "null") {
            setSelectedBarberId(parseInt(savedBarberId));
        }
    }, []);

    const handleSelectBarber = (barberId: number) => {
        setSelectedBarberId(barberId);
        sessionStorage.setItem("selectedBarberId", barberId.toString());
    };

    const handleSelectAnyBarber = () => {
        setSelectedBarberId(0);
        sessionStorage.setItem("selectedBarberId", "0");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBarberId === null) return;

        setIsSubmitting(true);

        router.get("/booking/step-2", {
            barber_id: selectedBarberId,
        });
    };

    const getRating = (rating: number | string): number => {
        const parsed =
            typeof rating === "number" ? rating : Number(rating ?? 0);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 4.9;
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating - fullStars >= 0.5;
        const stars: JSX.Element[] = []; // Add explicit type

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <span key={i} className="text-yellow-500 text-xs">
                        ★
                    </span>,
                );
            } else if (hasHalf && i === fullStars + 1) {
                stars.push(
                    <span key={i} className="text-yellow-500 text-xs">
                        ½
                    </span>,
                );
            } else {
                stars.push(
                    <span key={i} className="text-gray-300 text-xs">
                        ★
                    </span>,
                );
            }
        }
        return stars;
    };
    return (
        <>
            <Head title="Select Barber — BEZ Hair Studio" />
            <Header />

            <main className="min-h-screen bg-[#faf9f6] pb-12">
                <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
                    <StepIndicator currentStep={1} />

                    {/* Barbers Grid */}
                    {barbers.length === 0 ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white py-12 text-center shadow-sm">
                            <div className="text-gray-400 mb-4">
                                <svg
                                    className="w-16 h-16 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                No Barbers Available
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Please check back later for available barbers.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                                {barbers.map((barber) => (
                                    <button
                                        type="button"
                                        key={barber.id}
                                        onClick={() =>
                                            handleSelectBarber(barber.id)
                                        }
                                        aria-pressed={
                                            selectedBarberId === barber.id
                                        }
                                        className={`relative flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
                                            selectedBarberId === barber.id
                                                ? "border-amber-600 ring-2 ring-amber-100"
                                                : "border-neutral-200 hover:border-neutral-400"
                                        }`}
                                    >
                                        {/* Checkmark for selected */}
                                        {selectedBarberId === barber.id && (
                                            <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">
                                                ✓
                                            </div>
                                        )}

                                        {/* Barber Image */}
                                        <img
                                            src={resolveUploadImageUrl(
                                                barber.profile_image,
                                                profileImage,
                                                "/uploads/barbers",
                                            )}
                                            alt=""
                                            className={`
                                                h-20 w-16 flex-shrink-0 rounded-xl object-cover transition-all duration-300
                                                ${selectedBarberId === barber.id ? "grayscale-0" : "grayscale"}
                                            `}
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src = profileImage;
                                            }}
                                        />

                                        {/* Barber Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-neutral-950">
                                                {barber.full_name}
                                            </div>
                                            <div className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
                                                {barber.specialty ||
                                                    "Master Barber"}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex">
                                                    {renderStars(
                                                        getRating(
                                                            barber.rating,
                                                        ),
                                                    )}
                                                </div>
                                                <span className="text-xs text-neutral-600">
                                                    {getRating(
                                                        barber.rating,
                                                    ).toFixed(1)}
                                                </span>
                                            </div>
                                            {barber.experience_years > 0 && (
                                                <div className="mt-1 text-xs text-neutral-500">
                                                    {barber.experience_years}{" "}
                                                    years experience
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Any Available Barber Option */}
                            <button
                                type="button"
                                onClick={handleSelectAnyBarber}
                                aria-pressed={selectedBarberId === 0}
                                className={`mb-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
                                    selectedBarberId === 0
                                        ? "border-amber-600 bg-amber-50 text-neutral-950"
                                        : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500 hover:text-neutral-950"
                                }`}
                            >
                                <span className="text-lg leading-none">+</span>
                                <span>
                                    Any Available Barber
                                </span>
                                {selectedBarberId === 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">
                                        ✓
                                    </span>
                                )}
                            </button>
                        </>
                    )}

                    {/* Navigation Buttons */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center justify-between border-t border-neutral-200 pt-5"
                    >
                        <button
                            type="button"
                            onClick={() => router.visit("/")}
                            className="rounded-full px-4 py-3 text-sm text-neutral-600 transition-colors hover:bg-white hover:text-neutral-950"
                        >
                            ← Back
                        </button>
                        <button
                            type="submit"
                            disabled={selectedBarberId === null || isSubmitting}
                            className={`
                                rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors
                                ${selectedBarberId === null || isSubmitting ? "cursor-not-allowed opacity-40" : "hover:bg-neutral-800"}
                            `}
                        >
                            {isSubmitting ? "Loading..." : "Next Step →"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
