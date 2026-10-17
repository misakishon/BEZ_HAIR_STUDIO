import React, { useState, useEffect } from "react";
import {
    Star,
    Clock,
    Award,
    Mail,
    Phone,
    MapPin,
    User,
    Scissors,
    Calendar,
    BookOpen,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
    X,
} from "lucide-react";
const profileImage = "/uploads/barbers/defaultBarber.jpg";
import { resolveUploadImageUrl } from "@/utils/imageUrls";

interface Barber {
    id: number;
    full_name: string;
    specialty: string;
    rating: number | string;
    total_reviews: number | string;
    experience_years: number;
    profile_image: string;
    is_available: number;
    bio: string;
    email?: string;
    phone?: string;
    location?: string;
    introduction?: string;
    certifications?: string[];
    specialties?: string[];
}

interface BarbersSectionProps {
    barbers?: Barber[];
}

function BarbersSection({ barbers: initialBarbers = [] }: BarbersSectionProps) {
    const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
    const [isLoading, setIsLoading] = useState(!initialBarbers.length);
    const [ratingModalBarberId, setRatingModalBarberId] = useState<number | null>(null);
    const [ratingModalValue, setRatingModalValue] = useState<number>(5);
    const [ratingComment, setRatingComment] = useState("");
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [ratingError, setRatingError] = useState<string | null>(null);

    useEffect(() => {
        if (initialBarbers.length === 0) {
            fetchBarbers();
        } else {
            setIsLoading(false);
        }
    }, [initialBarbers]);

    const fetchBarbers = async () => {
        try {
            const response = await fetch("/api/barbers");
            const data = await response.json();
            setBarbers(data);
        } catch (error) {
            console.error("Error fetching barbers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRating = (rating: number | string): number => {
        const parsed =
            typeof rating === "number" ? rating : Number(rating ?? 0);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 4.9;
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating - fullStars >= 0.5;
        const stars: JSX.Element[] = [];

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                    />,
                );
            } else if (hasHalf && i === fullStars + 1) {
                stars.push(
                    <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400/50 text-amber-400"
                    />,
                );
            } else {
                stars.push(
                    <Star
                        key={i}
                        className="w-4 h-4 fill-stone-100 text-stone-300"
                    />,
                );
            }
        }
        return stars;
    };

    const openRatingModal = (barberId: number, currentRating: number) => {
        setRatingModalBarberId(barberId);
        setRatingModalValue(
            Math.max(1, Math.min(5, Math.round(currentRating) || 5)),
        );
        setRatingComment("");
        setRatingError(null);
    };

    const closeRatingModal = () => {
        setRatingModalBarberId(null);
        setRatingComment("");
        setRatingError(null);
    };

    const submitRating = async (barberId: number) => {
        setRatingSubmitting(true);
        setRatingError(null);

        try {
            const response = await fetch(`/api/barbers/${barberId}/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    rating: ratingModalValue,
                    comment: ratingComment.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit rating");
            }

            const updated = await response.json();
            setBarbers((prev) =>
                prev.map((barber) =>
                    barber.id === barberId
                        ? {
                              ...barber,
                              rating: updated.rating,
                              total_reviews: updated.total_reviews,
                          }
                        : barber,
                ),
            );
            closeRatingModal();
        } catch (error) {
            setRatingError(
                error instanceof Error
                    ? error.message
                    : "Unable to submit rating",
            );
        } finally {
            setRatingSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <section className="w-full bg-stone-50/50 py-20 md:py-28 border-b border-neutral-200/60">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
                    <div className="text-center animate-pulse">
                        <div className="h-5 w-40 mx-auto bg-stone-200 rounded-full mb-4"></div>
                        <div className="h-9 w-64 mx-auto bg-stone-200 rounded-xl mb-4"></div>
                        <div className="max-w-4xl mx-auto h-[480px] bg-stone-100 rounded-3xl mt-8"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-stone-50/50 py-20 md:py-28 border-b border-neutral-200/70 relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
                {/* SECTION HEADER */}
                <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-amber-900 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Artisans of the Craft</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 tracking-tight leading-tight">
                        Meet Our Master Barbers
                    </h2>
                    <p className="text-sm sm:text-base text-neutral-600 font-light max-w-md mx-auto leading-relaxed">
                        Meticulous precision, personalized consultation, and years of dedicated hair artistry for every client.
                    </p>
                </div>

                {barbers.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 max-w-xl mx-auto p-8 shadow-xs">
                        <Scissors className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 font-medium text-sm">
                            No barbers currently scheduled. Please check back shortly.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-12">
                        {barbers.map((barber) => {
                            const rating = getRating(barber.rating);

                            const aboutText =
                                barber.introduction ||
                                barber.bio ||
                                `${barber.full_name} is a dedicated ${barber.specialty || "Master Barber"} with over ${barber.experience_years} years of craft experience. Known for precision tapers, clean fades, and exceptional attention to detail.`;

                            const certifications = barber.certifications || [
                                "Licensed Master Barber",
                                "Advanced Fade Specialist",
                                "Precision Beard Sculpting",
                            ];

                            const specialties = barber.specialties || [
                                "Fade & Taper",
                                "Classic Cuts",
                                "Hot Towel Shave",
                            ];

                            const isAvailable = barber.is_available === 1;

                            return (
                                <div
                                    key={barber.id}
                                    className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group"
                                >
                                    <div className="grid md:grid-cols-12 gap-0">
                                        {/* Left - Portrait Container (5 of 12 columns) */}
                                        <div className="md:col-span-5 relative overflow-hidden bg-neutral-900 min-h-[380px] md:min-h-[520px]">
                                            <img
                                                src={resolveUploadImageUrl(
                                                    barber.profile_image,
                                                    profileImage,
                                                    "/uploads/barbers",
                                                )}
                                                alt={barber.full_name}
                                                className="w-full h-full object-cover object-top filter brightness-[0.95] group-hover:scale-105 group-hover:brightness-100 transition-all duration-700"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src = profileImage;
                                                }}
                                            />
                                            {/* Gradient base for text contrast */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                                            {/* Status Badge */}
                                            <div className="absolute top-5 left-5">
                                                {isAvailable ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                        Available for Booking
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-800/80 text-neutral-300 backdrop-blur-md">
                                                        Currently Booked
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Mobile Overlay Info */}
                                            <div className="absolute bottom-4 left-5 right-5 text-white md:hidden">
                                                <h3 className="text-xl font-bold">{barber.full_name}</h3>
                                                <p className="text-xs text-amber-300">{barber.specialty || "Master Barber"}</p>
                                            </div>
                                        </div>

                                        {/* Right - Details (7 of 12 columns) */}
                                        <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                {/* Header & Rating */}
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-2xl sm:text-3xl font-serif text-neutral-900 tracking-tight">
                                                            {barber.full_name}
                                                        </h3>
                                                        <p className="text-xs font-semibold tracking-wider text-amber-700 uppercase mt-1">
                                                            {barber.specialty || "Master Barber"}
                                                        </p>
                                                    </div>

                                                    {/* Rating pill with rate button */}
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/70">
                                                            <div className="flex">
                                                                {renderStars(rating)}
                                                            </div>
                                                            <span className="text-sm font-bold text-neutral-900">
                                                                {rating.toFixed(1)}
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => openRatingModal(barber.id, rating)}
                                                            className="text-xs text-neutral-500 hover:text-amber-700 font-medium transition-colors inline-flex items-center gap-1"
                                                        >
                                                            <MessageSquare className="w-3 h-3" />
                                                            Leave a Review
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Inline Rating Modal / Form */}
                                                {ratingModalBarberId === barber.id && (
                                                    <div className="p-5 bg-stone-50 border border-amber-200/80 rounded-2xl shadow-xs transition-all animate-in fade-in">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="text-sm font-bold text-neutral-900">
                                                                    Review {barber.full_name}
                                                                </p>
                                                                <p className="text-xs text-neutral-500">
                                                                    Tap stars to choose your rating:
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="text-stone-400 hover:text-stone-700 p-1"
                                                                onClick={closeRatingModal}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-2 mb-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setRatingModalValue(star)}
                                                                    className={`rounded-xl p-2.5 transition-all ${
                                                                        star <= ratingModalValue
                                                                            ? "bg-amber-500 text-white shadow-xs scale-105"
                                                                            : "bg-white text-stone-300 hover:bg-stone-100 border border-stone-200"
                                                                    }`}
                                                                >
                                                                    <Star className="w-4 h-4 fill-current" />
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <textarea
                                                            rows={2}
                                                            value={ratingComment}
                                                            onChange={(e) => setRatingComment(e.target.value)}
                                                            placeholder="Share your experience (e.g., attention to detail, fade smoothness)..."
                                                            className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                                                        />

                                                        {ratingError && (
                                                            <p className="mt-2 text-xs text-red-600 font-medium">
                                                                {ratingError}
                                                            </p>
                                                        )}

                                                        <div className="mt-3 flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={ratingSubmitting}
                                                                onClick={() => submitRating(barber.id)}
                                                                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                                                            >
                                                                {ratingSubmitting ? "Submitting..." : "Post Review"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* About quote block */}
                                                <div className="border-l-2 border-amber-500 pl-4 py-0.5">
                                                    <p className="text-sm text-neutral-600 leading-relaxed italic">
                                                        "{aboutText}"
                                                    </p>
                                                </div>

                                                {/* Experience & Specialties Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                                                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-700">
                                                            <Award className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                                Experience
                                                            </p>
                                                            <p className="text-sm font-bold text-neutral-900">
                                                                {barber.experience_years} Years Master Craftsman
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                                                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-700">
                                                            <Calendar className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                                Schedule
                                                            </p>
                                                            <p className="text-sm font-bold text-neutral-900">
                                                                Mon – Sat: 9AM – 8PM
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Specialties Badges */}
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                                                        Signature Specialties
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {specialties.map((spec, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs font-medium text-neutral-700 bg-white border border-stone-200 px-3 py-1 rounded-full shadow-2xs"
                                                            >
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Certifications */}
                                                {certifications.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                                        {certifications.map((cert, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50/80 border border-amber-200/60 px-3 py-1 rounded-full font-medium"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                                                                {cert}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Bar Footer */}
                                            <div className="mt-8 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                                    <span>Standard Appointment: 45 - 60 min</span>
                                                </div>

                                                {isAvailable ? (
                                                    <a
                                                        href={`/booking/step-1?barber_id=${barber.id}`}
                                                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-neutral-900 text-white text-xs font-semibold tracking-wider uppercase rounded-xl shadow-md hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98] transition-all group/btn"
                                                    >
                                                        <span>Book with {barber.full_name.split(" ")[0]}</span>
                                                        <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover/btn:translate-x-1" />
                                                    </a>
                                                ) : (
                                                    <span className="px-6 py-3 bg-neutral-100 text-neutral-400 text-xs font-semibold tracking-wider uppercase rounded-xl cursor-not-allowed">
                                                        Currently Booked Out
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default BarbersSection;
