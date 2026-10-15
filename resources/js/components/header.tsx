import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";

function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogoVisible, setIsLogoVisible] = useState(false);

    const page = usePage();
    const currentUrl =
        page.url && typeof window !== "undefined"
            ? new URL(page.url, window.location.origin)
            : undefined;
    const currentPath =
        currentUrl?.pathname ||
        (typeof window !== "undefined" ? window.location.pathname : "");
    const isHomePage = currentPath === "/";
    const isBookingPage = currentPath.startsWith("/booking");

    useEffect(() => {
        const handleScroll = () => {
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // On mobile: show logo always (but controlled by menu state)
                setIsLogoVisible(!isMobileMenuOpen);
                setIsScrolled(window.scrollY > 50);
            } else {
                // On desktop: show logo only after scroll
                if (window.scrollY > 100) {
                    setIsScrolled(true);
                    setIsLogoVisible(true);
                } else {
                    setIsScrolled(false);
                    setIsLogoVisible(false);
                }
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentPath]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
            // Hide logo on mobile when menu opens
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                setIsLogoVisible(false);
            }
        } else {
            document.body.style.overflow = "unset";
            // Show logo on mobile when menu closes
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                setIsLogoVisible(true);
            }
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    const handleScrollToSection = (
        e: React.MouseEvent<HTMLAnchorElement>,
        id: string,
    ) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);

        const targetSection = document.getElementById(id);

        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
            return;
        }

        const basePath =
            document.querySelector("base")?.getAttribute("href") || "/";
        const normalizedBase = basePath.endsWith("/")
            ? basePath
            : `${basePath}/`;
        window.location.href = `${window.location.origin}${normalizedBase}#${id}`;
    };

    return (
        <>
            <nav
                className={`w-full bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 transition-all duration-300 ${
                    isScrolled ? "py-2" : "py-3 sm:py-4"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* DESKTOP LOGO - Hidden on mobile */}
                    <div
                        className={`hidden md:flex items-center transition-all duration-500 ease-in-out ${
                            isLogoVisible
                                ? "opacity-100 visible translate-x-0"
                                : "opacity-0 invisible -translate-x-4 pointer-events-none"
                        }`}
                    >
                        <a
                            href="#home"
                            onClick={(e) => handleScrollToSection(e, "home")}
                            className="flex flex-col select-none group"
                        >
                            <span className="text-xl sm:text-2xl font-light tracking-[0.25em] text-black leading-none uppercase transition-colors group-hover:text-neutral-600">
                                B E Z<span className="font-normal">.</span>
                            </span>
                            <span className="hidden sm:block text-[8px] sm:text-[9px] tracking-[0.65em] font-light text-black/70 uppercase mt-1 sm:mt-1.5 transition-colors group-hover:text-black">
                                HAIR STUDIO
                            </span>
                        </a>
                    </div>

                    {/* MOBILE LOGO - Always visible on mobile, hidden when menu is open */}
                    <div
                        className={`md:hidden flex items-center transition-all duration-300 ${
                            isMobileMenuOpen
                                ? "opacity-0 scale-95 pointer-events-none"
                                : "opacity-100 scale-100"
                        }`}
                    >
                        <a
                            href="#home"
                            onClick={(e) => handleScrollToSection(e, "home")}
                            className="flex flex-col select-none"
                        >
                            <span className="text-xl font-light tracking-[0.25em] text-black leading-none uppercase">
                                B E Z<span className="font-normal">.</span>
                            </span>
                        </a>
                    </div>

                    {/* DESKTOP NAVIGATION - Centered */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-6 lg:gap-8 text-xs font-medium uppercase tracking-widest text-neutral-500">
                        <a
                            href="#home"
                            onClick={(e) => handleScrollToSection(e, "home")}
                            className={`transition-colors ${
                                isHomePage
                                    ? "text-black font-semibold"
                                    : "text-neutral-500 hover:text-black"
                            }`}
                        >
                            Home
                        </a>
                        <a
                            href="#haircut"
                            onClick={(e) => handleScrollToSection(e, "haircut")}
                            className="text-neutral-500 hover:text-black transition-colors"
                        >
                            Haircut
                        </a>
                        <a
                            href="#barbers"
                            onClick={(e) => handleScrollToSection(e, "barbers")}
                            className="text-neutral-500 hover:text-black transition-colors"
                        >
                            Barbers
                        </a>
                        <a
                            href="#contact"
                            onClick={(e) => handleScrollToSection(e, "contact")}
                            className="text-neutral-500 hover:text-black transition-colors"
                        >
                            Contact
                        </a>
                        <Link
                            href="/booking/step-1"
                            className={`transition-colors ${
                                isBookingPage
                                    ? "text-black font-semibold"
                                    : "text-neutral-500 hover:text-black"
                            }`}
                        >
                            Book
                        </Link>
                    </div>

                    {/* RIGHT SIDE - Book Button & Hamburger */}
                    <div className="flex items-center gap-3">
                        {/* Desktop Book Button */}
                        <Link
                            href="/booking/step-1"
                            className={`hidden sm:block px-4 sm:px-6 py-2 text-xs font-medium uppercase tracking-wider border border-black/40 rounded-md transition-all ${
                                isBookingPage
                                    ? "bg-black text-white"
                                    : "text-black hover:bg-black hover:text-white hover:border-black"
                            }`}
                        >
                            Book Now
                        </Link>

                        {/* Mobile Menu Button (Hamburger) */}
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none relative z-50"
                            aria-label="Toggle menu"
                        >
                            <span className="relative w-5 h-5">
                                <span
                                    className={`absolute top-1/2 left-0 w-5 h-0.5 bg-black transition-all duration-300 ease-in-out ${
                                        isMobileMenuOpen
                                            ? "rotate-45 translate-y-0"
                                            : "-translate-y-1.5"
                                    }`}
                                />
                                <span
                                    className={`absolute top-1/2 left-0 w-5 h-0.5 bg-black transition-all duration-300 ease-in-out ${
                                        isMobileMenuOpen
                                            ? "opacity-0"
                                            : "opacity-100"
                                    }`}
                                />
                                <span
                                    className={`absolute top-1/2 left-0 w-5 h-0.5 bg-black transition-all duration-300 ease-in-out ${
                                        isMobileMenuOpen
                                            ? "-rotate-45 translate-y-0"
                                            : "translate-y-1.5"
                                    }`}
                                />
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU OVERLAY */}
            <div
                className={`
                    fixed inset-0 bg-black/50 z-40 transition-all duration-300 md:hidden
                    ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* MOBILE MENU PANEL */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out md:hidden
                    ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                        <div className="flex flex-col">
                            <span className="text-lg font-light tracking-[0.25em] text-black leading-none">
                                B E Z<span className="font-normal">.</span>
                            </span>
                            <span className="text-[8px] tracking-[0.65em] font-light text-black/70 uppercase mt-1">
                                HAIR STUDIO
                            </span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                            aria-label="Close menu"
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
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="flex-1 flex flex-col p-4 space-y-4">
                        <a
                            href="#home"
                            onClick={(e) => handleScrollToSection(e, "home")}
                            className={`text-sm font-medium uppercase tracking-wider py-2 transition-colors ${
                                isHomePage
                                    ? "text-black font-semibold"
                                    : "text-neutral-600 hover:text-black"
                            }`}
                        >
                            Home
                        </a>
                        <a
                            href="#haircut"
                            onClick={(e) => handleScrollToSection(e, "haircut")}
                            className="text-sm font-medium uppercase tracking-wider py-2 text-neutral-600 hover:text-black transition-colors"
                        >
                            Haircut
                        </a>
                        <a
                            href="#barbers"
                            onClick={(e) => handleScrollToSection(e, "barbers")}
                            className="text-sm font-medium uppercase tracking-wider py-2 text-neutral-600 hover:text-black transition-colors"
                        >
                            Barbers
                        </a>
                        <a
                            href="#contact"
                            onClick={(e) => handleScrollToSection(e, "contact")}
                            className="text-sm font-medium uppercase tracking-wider py-2 text-neutral-600 hover:text-black transition-colors"
                        >
                            Contact
                        </a>

                        <div className="pt-4 border-t border-neutral-100">
                            <Link
                                href="/booking/step-1"
                                className={`block w-full text-center px-4 py-3 text-sm font-medium uppercase tracking-wider rounded-md transition-all ${
                                    isBookingPage
                                        ? "bg-black text-white"
                                        : "bg-black text-white hover:bg-neutral-800"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Book Appointment
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;
