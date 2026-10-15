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
    const [ratingModalBarberId, setRatingModalBarberId] = useState<
        number | null
    >(null);
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

    // const getTotalReviews = (reviews: number | string): number => {
    //     return typeof reviews === "number" ? reviews : Number(reviews || 0);
    // };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating - fullStars >= 0.5;
        const stars: JSX.Element[] = []; // Add explicit type

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 stroke-yellow-400"
                    />,
                );
            } else if (hasHalf && i === fullStars + 1) {
                stars.push(
                    <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400/50 stroke-yellow-400"
                    />,
                );
            } else {
                stars.push(
                    <Star
                        key={i}
                        className="w-4 h-4 fill-none stroke-gray-300"
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
            <section className="w-full bg-white py-16 md:py-24 border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="h-4 w-32 mx-auto bg-neutral-200 rounded mb-4"></div>
                            <div className="h-8 w-48 mx-auto bg-neutral-200 rounded mb-6"></div>
                            <div className="max-w-4xl mx-auto h-96 bg-neutral-100 rounded"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-white py-16 md:py-24 border-b border-neutral-100">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
                {/* SECTION HEADER */}
                <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
                    <span className="text-xs font-semibold tracking-[0.30em] text-neutral-400 uppercase">
                        Meet Our Team
                    </span>
                    <h2 className="text-3xl md:text-4xl font-normal text-black tracking-tight uppercase">
                        Our Barbers
                    </h2>
                    <p className="text-sm text-neutral-500 font-light max-w-sm mx-auto leading-relaxed">
                        Professional, licensed, and passionate about giving you
                        the perfect cut.
                    </p>
                </div>

                {barbers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-400">
                            No barbers available at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-12">
                        {barbers.map((barber) => {
                            const rating = getRating(barber.rating);
                            // const totalReviews = getTotalReviews(
                            //     barber.total_reviews,
                            // );

                            const aboutText =
                                barber.introduction ||
                                barber.bio ||
                                `${barber.full_name} is a dedicated ${barber.specialty || "Master Barber"} with over ${barber.experience_years} years of experience. Known for precision cuts and exceptional attention to detail, ${barber.full_name.split(" ")[0]} specializes in creating personalized looks that enhance each client's natural features. Passionate about the art of barbering, ${barber.full_name.split(" ")[0]} stays current with the latest trends and techniques to deliver modern, fresh styles.`;

                            // Sample certifications if not provided
                            const certifications = barber.certifications || [
                                "Licensed Master Barber",
                                "Advanced Fade Techniques",
                                "Hair Design Specialist",
                            ];

                            const specialties = barber.specialties || [
                                "Fade & Taper",
                                "Classic Cuts",
                            ];

                            return (
                                <div
                                    key={barber.id}
                                    className="bg-white border border-neutral-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="grid md:grid-cols-5 gap-0">
                                        {/* Left - Image (2 columns) */}
                                        <div className="md:col-span-2 relative overflow-hidden bg-neutral-50">
                                            <img
                                                src={resolveUploadImageUrl(
                                                    barber.profile_image,
                                                    profileImage,
                                                    "/uploads/barbers",
                                                )}
                                                alt={barber.full_name}
                                                className="w-full h-full min-h-[350px] md:min-h-[500px] object-cover hover:grayscale-0 transition-all duration-700"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src = profileImage;
                                                }}
                                            />
                                            {/* Status Badge */}
                                            {barber.is_available === 1 && (
                                                <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded">
                                                    Available
                                                </span>
                                            )}
                                            {barber.is_available === 0 && (
                                                <span className="absolute top-4 left-4 bg-neutral-400 text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded">
                                                    Unavailable
                                                </span>
                                            )}
                                        </div>

                                        {/* Right - Details (3 columns) */}
                                        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                                            <div>
                                                {/* Name & Specialty */}
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-black">
                                                            {barber.full_name}
                                                        </h3>
                                                        <p className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
                                                            {barber.specialty ||
                                                                "Master Barber"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-semibold text-black">
                                                            {rating.toFixed(1)}
                                                        </span>
                                                        <div className="flex">
                                                            {renderStars(
                                                                rating,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rating & Reviews */}
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {/* <span className="text-xs text-neutral-400">
                                                        ({totalReviews} reviews)
                                                    </span> */}
                                                </div>

                                                {ratingModalBarberId ===
                                                    barber.id && (
                                                    <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-lg shadow-sm">
                                                        <div className="flex items-center justify-between gap-4 mb-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-black">
                                                                    Rate{" "}
                                                                    {
                                                                        barber.full_name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-neutral-500">
                                                                    Choose a
                                                                    rating and
                                                                    submit.
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="text-xs text-neutral-500 hover:text-black"
                                                                onClick={
                                                                    closeRatingModal
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setRatingModalValue(
                                                                            star,
                                                                        )
                                                                    }
                                                                    className={`rounded-full p-2 transition ${
                                                                        star <=
                                                                        ratingModalValue
                                                                            ? "bg-amber-100 text-amber-600"
                                                                            : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                                                                    }`}
                                                                >
                                                                    <Star className="w-4 h-4" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            rows={3}
                                                            value={
                                                                ratingComment
                                                            }
                                                            onChange={(e) =>
                                                                setRatingComment(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Share your experience with this barber..."
                                                            className="mt-3 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
                                                        />
                                                        {ratingError && (
                                                            <p className="mt-3 text-xs text-red-600">
                                                                {ratingError}
                                                            </p>
                                                        )}
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                ratingSubmitting
                                                            }
                                                            onClick={() =>
                                                                submitRating(
                                                                    barber.id,
                                                                )
                                                            }
                                                            className="mt-4 inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {ratingSubmitting
                                                                ? "Submitting..."
                                                                : "Submit Rating"}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Introduction / About */}
                                                <div className="mt-5 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BookOpen className="w-4 h-4 text-amber-600" />
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                            About{" "}
                                                            {
                                                                barber.full_name.split(
                                                                    " ",
                                                                )[0]
                                                            }
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-700 leading-relaxed">
                                                        {aboutText}
                                                    </p>
                                                </div>

                                                {/* Experience & Specialties */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Award className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                                Experience
                                                            </p>
                                                            <p className="text-sm font-medium text-black">
                                                                {
                                                                    barber.experience_years
                                                                }{" "}
                                                                years
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Scissors className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                                Specialties
                                                            </p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {specialties
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            spec,
                                                                            idx,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded"
                                                                            >
                                                                                {
                                                                                    spec
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Certifications */}
                                                {certifications.length > 0 && (
                                                    <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                                                            Certifications
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {certifications.map(
                                                                (cert, idx) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                                                                    >
                                                                        {cert}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Contact Info */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                    {barber.email && (
                                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                            <Mail className="w-4 h-4" />
                                                            <span>
                                                                {barber.email}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {barber.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                            <Phone className="w-4 h-4" />
                                                            <span>
                                                                {barber.phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {barber.location && (
                                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>
                                                                {
                                                                    barber.location
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            Mon - Sat, 9AM - 7PM
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Book Button */}
                                            <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-neutral-400" />
                                                    <span className="text-xs text-neutral-400">
                                                        {barber.is_available ===
                                                        1
                                                            ? "Ready for your appointment"
                                                            : "Currently unavailable"}
                                                    </span>
                                                </div>
                                                {barber.is_available === 1 && (
                                                    <a
                                                        href={`/booking/step-1?barber_id=${barber.id}`}
                                                        className="px-8 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider rounded-md hover:bg-neutral-800 transition-all inline-flex items-center gap-2"
                                                    >
                                                        Book with{" "}
                                                        {
                                                            barber.full_name.split(
                                                                " ",
                                                            )[0]
                                                        }
                                                        <span className="text-xs">
                                                            →
                                                        </span>
                                                    </a>
                                                )}
                                                {barber.is_available === 0 && (
                                                    <span className="px-8 py-3 bg-neutral-200 text-neutral-500 text-sm font-medium uppercase tracking-wider rounded-md cursor-not-allowed">
                                                        Currently Unavailable
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
