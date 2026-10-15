import React, { useState, useEffect, useCallback } from "react";
import { Link } from "@inertiajs/react";
import { resolveUploadImageUrl } from "../utils/imageUrls";

interface Hairstyle {
    id: number;
    name: string;
    duration_minutes: number;
    price: number | string;
    image_path?: string | null;
}

interface PopularHairstylesProps {
    hairstyles?: Hairstyle[];
}

const DEFAULT_HAIRSTYLES: Hairstyle[] = [
    {
        id: 1,
        name: "High Fade",
        duration_minutes: 30,
        price: 300,
        image_path: "/uploads/hairstyle/default.jpg",
    },
    {
        id: 2,
        name: "Buzz Cut",
        duration_minutes: 30,
        price: 300,
        image_path: "/uploads/hairstyle/default.jpg",
    },
    {
        id: 3,
        name: "Curly Fade",
        duration_minutes: 30,
        price: 300,
        image_path: "/uploads/hairstyle/default.jpg",
    },
    {
        id: 4,
        name: "Fade Cut",
        duration_minutes: 30,
        price: 300,
        image_path: "/uploads/hairstyle/default.jpg",
    },
    {
        id: 5,
        name: "Taper Cut",
        duration_minutes: 30,
        price: 300,
        image_path: "/uploads/hairstyle/default.jpg",
    },
];

export default function PopularHairstyles({ hairstyles }: PopularHairstylesProps) {
    const styles: Hairstyle[] =
        hairstyles && hairstyles.length > 0
            ? hairstyles
            : DEFAULT_HAIRSTYLES;

    // Center card active by default
    const [activeIndex, setActiveIndex] = useState<number>(() =>
        Math.min(2, Math.max(0, Math.floor(styles.length / 2)))
    );
    const [viewMode, setViewMode] = useState<"curve" | "grid">("curve");
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    const total = styles.length;

    const getPrice = (price: number | string): number => {
        return typeof price === "number" ? price : Number(price || 0);
    };

    const handlePrev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    const handleNext = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handlePrev, handleNext]);

    // Touch and drag swipe handlers
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        setTouchStartX(clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
        if (touchStartX === null) return;
        const clientX =
            "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
        const diff = touchStartX - clientX;
        if (diff > 45) {
            handleNext();
        } else if (diff < -45) {
            handlePrev();
        }
        setTouchStartX(null);
    };

    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
            {/* Header with Title & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
                        Signature Cuts
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-0.5">
                        Popular Hairstyles
                    </h3>
                </div>

                {/* View Switcher: Curve View vs Grid View */}
                <div className="flex items-center bg-neutral-100 p-1 rounded-full border border-neutral-200/70 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setViewMode("curve")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                            viewMode === "curve"
                                ? "bg-black text-white shadow-md scale-100"
                                : "text-neutral-500 hover:text-neutral-900"
                        }`}
                        title="3D Curved Panoramic View"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                        >
                            <path d="M3 17c5-7 13-7 18 0" />
                            <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                        </svg>
                        <span>Curved View</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                            viewMode === "grid"
                                ? "bg-black text-white shadow-md scale-100"
                                : "text-neutral-500 hover:text-neutral-900"
                        }`}
                        title="Standard Grid View"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span>Grid</span>
                    </button>
                </div>
            </div>

            {/* CURVED VIEW */}
            {viewMode === "curve" ? (
                <div
                    className="relative w-full select-none"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {/* Subtle Curved Stage Track Backdrop Line */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-80 pointer-events-none opacity-40 -z-10 overflow-hidden">
                        <svg
                            viewBox="0 0 1000 240"
                            className="w-full h-full"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M 40 180 Q 500 50 960 180"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                                strokeDasharray="4 6"
                            />
                        </svg>
                    </div>

                    {/* 3D Curved Arc Stage */}
                    <div
                        className="relative w-full h-[470px] sm:h-[510px] md:h-[540px] flex items-center justify-center overflow-hidden"
                        style={{
                            perspective: "1200px",
                            perspectiveOrigin: "50% 45%",
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleTouchStart}
                        onMouseUp={handleTouchEnd}
                    >
                        {styles.map((style, idx) => {
                            // Calculate wrapped shortest circular offset from active card
                            let offset = (idx - activeIndex) % total;
                            if (offset > Math.floor(total / 2)) offset -= total;
                            if (offset < -Math.floor(total / 2)) offset += total;

                            const isCenter = offset === 0;
                            const absOffset = Math.abs(offset);
                            const price = getPrice(style.price);

                            // Curved geometry calculations
                            // X displacement across screen
                            const translateX = offset * 210;
                            // Parabolic downward curve: outer cards drop gracefully
                            const translateY =
                                absOffset === 0
                                    ? 0
                                    : absOffset === 1
                                    ? 22
                                    : 56;
                            // 3D inward rotation curving towards viewer
                            const rotateY = -offset * 16;
                            // Depth scale
                            const scale =
                                absOffset === 0
                                    ? 1.08
                                    : absOffset === 1
                                    ? 0.92
                                    : 0.8;
                            // Depth opacity
                            const opacity =
                                absOffset === 0
                                    ? 1
                                    : absOffset === 1
                                    ? 0.88
                                    : 0.65;
                            const zIndex = 30 - absOffset * 10;

                            // Hide items outside visible arc window if more than 5
                            if (absOffset > 2) {
                                return null;
                            }

                            return (
                                <div
                                    key={style.id}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`absolute top-1/2 left-1/2 cursor-pointer transition-all duration-500 ease-out group ${
                                        isCenter
                                            ? "cursor-default ring-2 ring-black/15 shadow-2xl rounded-3xl"
                                            : "hover:opacity-100"
                                    }`}
                                    style={{
                                        width: "215px",
                                        transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) rotateY(${rotateY}deg) scale(${scale})`,
                                        zIndex,
                                        opacity,
                                        transformOrigin: "center center",
                                        transformStyle: "preserve-3d",
                                    }}
                                >
                                    {/* Card Container with Curved Rounded Corners */}
                                    <div className="bg-white rounded-3xl p-3 shadow-md border border-neutral-200/80 transition-shadow duration-300 group-hover:shadow-xl">
                                        {/* Image Box */}
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
                                            <img
                                                src={resolveUploadImageUrl(
                                                    style.image_path,
                                                    "/uploads/hairstyle/default.jpg",
                                                    "/uploads/hairstyle",
                                                )}
                                                alt={style.name}
                                                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                                                    isCenter
                                                        ? "grayscale-0"
                                                        : "grayscale group-hover:grayscale-0"
                                                }`}
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src =
                                                        "/uploads/hairstyle/default.jpg";
                                                }}
                                            />

                                            {/* Duration Pill Badge */}
                                            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                <svg
                                                    className="w-2.5 h-2.5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                >
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M12 6v6l4 2" />
                                                </svg>
                                                {style.duration_minutes} MIN
                                            </div>

                                            {/* Active Highlight Ribbon */}
                                            {isCenter && (
                                                <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                                                    Popular
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Section */}
                                        <div className="mt-3 px-1">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-bold text-sm text-neutral-900 truncate">
                                                    {style.name}
                                                </h4>
                                                <span className="font-semibold text-sm text-neutral-900 ml-2 flex-shrink-0">
                                                    ₱{price.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Direct Booking CTA on center card */}
                                            {isCenter ? (
                                                <Link
                                                    href={`/booking/step-1?hairstyle=${style.id}`}
                                                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-black text-white py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
                                                >
                                                    <span>Book Style</span>
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </Link>
                                            ) : (
                                                <div className="mt-2 text-[11px] text-neutral-400 text-center font-medium">
                                                    Click to view
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation Circular Arrow Buttons */}
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200 text-neutral-700 shadow-lg hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center z-40 active:scale-95"
                        aria-label="Previous Hairstyle"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200 text-neutral-700 shadow-lg hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center z-40 active:scale-95"
                        aria-label="Next Hairstyle"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>

                    {/* Bottom Curved Position Indicators */}
                    <div className="flex justify-center items-center gap-2 mt-4">
                        {styles.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`rounded-full transition-all duration-300 ${
                                    index === activeIndex
                                        ? "w-8 h-2 bg-black"
                                        : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                /* CLASSIC GRID VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {styles.map((style) => {
                        const price = getPrice(style.price);
                        return (
                            <div
                                key={style.id}
                                className="group bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 relative">
                                    <img
                                        src={resolveUploadImageUrl(
                                            style.image_path,
                                            "/uploads/hairstyle/default.jpg",
                                            "/uploads/hairstyle",
                                        )}
                                        alt={style.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                        onError={(e) => {
                                            (
                                                e.target as HTMLImageElement
                                            ).src =
                                                "/uploads/hairstyle/default.jpg";
                                        }}
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider">
                                        {style.duration_minutes} MIN
                                    </div>
                                </div>
                                <div className="mt-2.5">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-sm text-neutral-900 truncate">
                                            {style.name}
                                        </h4>
                                        <span className="text-sm font-semibold text-neutral-900 ml-1">
                                            ₱{price.toFixed(2)}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/booking/step-1?hairstyle=${style.id}`}
                                        className="mt-2 block text-center bg-neutral-100 hover:bg-black hover:text-white py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
