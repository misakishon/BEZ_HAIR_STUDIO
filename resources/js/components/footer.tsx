import React from "react";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    ArrowUp,
    Scissors,
    Sparkles,
} from "lucide-react";
import { Link } from "@inertiajs/react";

function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="bg-neutral-950 text-white pt-16 pb-12 border-t border-neutral-900 relative overflow-hidden">
            {/* Subtle ambient lighting accent */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
                {/* Main 4-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-neutral-800/70">
                    {/* Col 1: Brand Identity & Mission (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="flex flex-col select-none">
                            <div className="text-2xl sm:text-3xl font-light tracking-[0.25em] text-white leading-none uppercase">
                                B E Z<span className="font-bold text-amber-500">.</span>
                            </div>
                            <span className="text-[10px] tracking-[0.6em] text-neutral-400 uppercase mt-2 font-medium">
                                Hair Studio
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mt-1">
                            A contemporary grooming sanctuary in Bangui, Ilocos Norte. Dedicated to tailored scissor work, flawless fades, and elevating client confidence.
                        </p>

                        <div className="pt-2">
                            <Link
                                href="/booking/step-1"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase hover:bg-amber-500 hover:text-black transition-all duration-200 group"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-black" />
                                <span>Reserve Your Chair</span>
                            </Link>
                        </div>
                    </div>

                    {/* Col 2: Studio Navigation (2 cols) */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            Explore
                        </h4>
                        <ul className="space-y-2.5 text-xs text-neutral-400 mt-1">
                            <li>
                                <a
                                    href="/#home"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Studio Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/#haircut"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Trending Styles
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/#barbers"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Master Barbers
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/#how-it-works"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    How it Works
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/#contact"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Location & Contact
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/booking/step-1"
                                    className="hover:text-amber-400 transition-colors"
                                >
                                    Online Booking
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Studio Coordinates (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            Studio Details
                        </h4>
                        <ul className="space-y-3 text-xs text-neutral-400 mt-1">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">
                                    San Lorenzo, Bangui,
                                    <br />
                                    Ilocos Norte, Philippines
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                                <a
                                    href="tel:+639123456789"
                                    className="hover:text-white transition-colors"
                                >
                                    +63 912 345 6789
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                                <a
                                    href="mailto:bezcutsfades@gmail.com"
                                    className="hover:text-white transition-colors"
                                >
                                    bezcutsfades@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Studio Schedule & Policy (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            Hours & Availability
                        </h4>
                        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 space-y-2 mt-1">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-300 font-medium">Monday – Saturday</span>
                                <span className="text-amber-400 font-semibold">9AM – 8PM</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-300 font-medium">Sunday</span>
                                <span className="text-neutral-500">By Appt.</span>
                            </div>
                            <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span>Walk-ins & Reservations Welcome</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
                    <p className="text-center sm:text-left">
                        &copy; {new Date().getFullYear()} BEZ Hair Studio. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors py-1 group"
                        >
                            <span>Back to Top</span>
                            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 text-amber-500" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
