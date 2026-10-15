import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import bgImage from "../../assets/bg.png";
import bgImagePhone from "../../assets/bgphone.png";

function HeroSection() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize(); // Check on mount
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <section className="relative w-full h-screen min-h-[700px] bg-white overflow-hidden flex items-center mb-0 pb-0">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div
                    className="h-full w-full bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${isMobile ? bgImagePhone : bgImage}')`,
                    }}
                />
                {/* Dark overlay to make text readable */}
                <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Light soft gradient overlay for smooth blending on smaller viewports */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none md:block hidden" />
            <div className="absolute inset-0 bg-white/80 z-10 pointer-events-none md:hidden block" />

            {/* MAIN CONTENT LAYER */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center">
                <div className="max-w-xl flex flex-col gap-6 md:gap-8">
                    {/* BRAND LOGO / HEADER */}
                    <div className="relative">
                        {/* Animated floating particles */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 rounded-full blur-2xl animate-pulse delay-1000" />

                        {/* Brand with 3D floating effect */}
                        <div className="flex flex-col select-none transform transition-all duration-500 hover:scale-105 hover:translate-y-[-5px]">
                            <h1 className="text-4xl md:text-5xl font-light tracking-[0.25em] text-black leading-none uppercase relative inline-block">
                                B E Z<span className="font-normal">.</span>
                                <span className="absolute inset-0 text-transparent bg-gradient-to-r from-black/20 to-transparent bg-clip-text blur-sm">
                                    B E Z.
                                </span>
                            </h1>
                            <p className="text-xs md:text-sm tracking-[0.65em] font-light text-black/70 uppercase mt-2 transition-all duration-700 hover:tracking-[0.85em] hover:text-black">
                                HAIR STUDIO
                            </p>
                        </div>

                        {/* MAIN COPY SECTION with stagger animation on scroll */}
                        <div className="flex flex-col gap-4 mt-4 transform transition-all duration-700 hover:translate-x-3">
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-black tracking-tight leading-[1.15]">
                                Modern Cuts. <br />
                                Clean Confidence.
                            </h2>

                            {/* Minimalist divider line with gradient animation */}
                            <div className="relative w-full max-w-md my-2">
                                <div className="h-[1px] bg-black/20 w-full" />
                                <div className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-amber-500 via-amber-500 to-transparent w-0 transition-all duration-1000 group-hover:w-full" />
                            </div>

                            <p className="text-black/80 text-sm sm:text-base max-w-md leading-relaxed font-light transition-all duration-500 hover:text-black hover:translate-x-2">
                                Experience premium haircuts and fades in a
                                modern and comfortable environment.
                            </p>
                        </div>
                    </div>

                    {/* INTERACTIVE CALL TO ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Link
                            href="/booking/step-1"
                            className="flex items-center justify-between px-6 py-3.5 bg-black text-white text-sm font-medium tracking-wide transition-all hover:bg-neutral-800 rounded-md w-full sm:w-60 group"
                        >
                            <span>Book Appointment</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <a
                            href="#"
                            className="flex items-center justify-between px-6 py-3.5 bg-white border border-black/40 text-black text-sm font-medium tracking-wide transition-all hover:bg-neutral-50 rounded-md w-full sm:w-60 group"
                        >
                            <span>Explore Styles</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
