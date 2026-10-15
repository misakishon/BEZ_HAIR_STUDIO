import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
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

            <main className="min-h-screen bg-[#f5f5f0] pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
                    {/* Step Indicator */}
                    <StepIndicator currentStep={1} />

                    {/* Section Title */}
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">
                        Select Your Barber
                    </h3>

                    {/* Barbers Grid */}
                    {barbers.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
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
                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {barbers.map((barber) => (
                                    <div
                                        key={barber.id}
                                        onClick={() =>
                                            handleSelectBarber(barber.id)
                                        }
                                        className={`
                                            flex gap-4 p-4 border cursor-pointer transition-all duration-300 relative bg-white
                                            ${
                                                selectedBarberId === barber.id
                                                    ? "border-black bg-gray-50"
                                                    : "border-gray-200 hover:border-black hover:translate-y-[-2px] hover:shadow-md"
                                            }
                                        `}
                                    >
                                        {/* Checkmark for selected */}
                                        {selectedBarberId === barber.id && (
                                            <div className="absolute top-3 right-3 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
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
                                            alt={barber.full_name}
                                            className={`
                                                w-16 h-20 object-cover flex-shrink-0 transition-all duration-300
                                                ${selectedBarberId === barber.id ? "grayscale-0" : "grayscale hover:grayscale-0"}
                                            `}
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src = profileImage;
                                            }}
                                        />

                                        {/* Barber Info */}
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {barber.full_name}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
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
                                                <span className="text-xs text-gray-600">
                                                    {getRating(
                                                        barber.rating,
                                                    ).toFixed(1)}
                                                </span>
                                            </div>
                                            {barber.experience_years > 0 && (
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {barber.experience_years}{" "}
                                                    years experience
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Any Available Barber Option */}
                            <div
                                onClick={handleSelectAnyBarber}
                                className={`
                                    flex items-center justify-center py-4 border-2 border-dashed cursor-pointer transition-all duration-300 mb-8
                                    ${
                                        selectedBarberId === 0
                                            ? "border-black bg-gray-50"
                                            : "border-gray-300 hover:border-black"
                                    }
                                `}
                            >
                                <span className="text-lg mr-2">+</span>
                                <span className="text-xs uppercase tracking-wider text-gray-500">
                                    Any Available Barber
                                </span>
                                {selectedBarberId === 0 && (
                                    <div className="ml-3 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                        ✓
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Navigation Buttons */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex justify-between"
                    >
                        <button
                            type="button"
                            onClick={() => router.visit("/")}
                            className="text-xs uppercase tracking-wider text-gray-400 hover:text-black transition"
                        >
                            ← Back
                        </button>
                        <button
                            type="submit"
                            disabled={selectedBarberId === null || isSubmitting}
                            className={`
                                px-8 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider transition
                                ${selectedBarberId === null || isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}
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
