import React, { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowRight, Menu, X } from "lucide-react";

const sectionLinks = [
    { label: "Home", id: "home" },
    { label: "Haircuts", id: "haircut" },
    { label: "Our barbers", id: "barbers" },
    { label: "How to book", id: "how-it-works" },
    { label: "Contact", id: "contact" },
];

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const page = usePage();
    const currentPath =
        page.url && typeof window !== "undefined"
            ? new URL(page.url, window.location.origin).pathname
            : "";
    const isHomePage = currentPath === "/";
    const isBookingPage = currentPath.startsWith("/booking");

    useEffect(() => {
        setIsMenuOpen(false);
    }, [currentPath]);

    useEffect(() => {
        if (!isMenuOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsMenuOpen(false);
        };
        const closeOnDesktop = () => {
            if (window.innerWidth >= 768) setIsMenuOpen(false);
        };

        window.addEventListener("keydown", closeOnEscape);
        window.addEventListener("resize", closeOnDesktop);
        return () => {
            window.removeEventListener("keydown", closeOnEscape);
            window.removeEventListener("resize", closeOnDesktop);
        };
    }, [isMenuOpen]);

    const handleSectionClick = (
        event: React.MouseEvent<HTMLAnchorElement>,
        id: string,
    ) => {
        const target = document.getElementById(id);
        setIsMenuOpen(false);

        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <header className="sticky top-0 z-50">
            <nav
                aria-label="Main navigation"
                className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl"
            >
                <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
                    <a
                        href="/#home"
                        onClick={(event) => handleSectionClick(event, "home")}
                        aria-label="BEZ Hair Studio home"
                        className="group flex shrink-0 flex-col leading-none"
                    >
                        <span className="text-xl font-medium tracking-[0.22em] text-neutral-950 transition-colors group-hover:text-amber-700">
                            BEZ<span className="text-amber-600">.</span>
                        </span>
                        <span className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.34em] text-neutral-500">
                            Hair Studio
                        </span>
                    </a>

                    <div className="hidden items-center gap-8 md:flex">
                        {sectionLinks.map(({ label, id }) => (
                            <a
                                key={id}
                                href={`/#${id}`}
                                onClick={(event) =>
                                    handleSectionClick(event, id)
                                }
                                aria-current={
                                    id === "home" && isHomePage
                                        ? "page"
                                        : undefined
                                }
                                className={`text-sm transition-colors hover:text-neutral-950 ${
                                    id === "home" && isHomePage
                                        ? "font-medium text-neutral-950"
                                        : "text-neutral-600"
                                }`}
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/booking/step-1"
                            className={`hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors sm:inline-flex ${
                                isBookingPage
                                    ? "bg-amber-500 text-neutral-950"
                                    : "bg-neutral-950 text-white hover:bg-neutral-800"
                            }`}
                        >
                            Book a visit
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-navigation"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 md:hidden"
                        >
                            {isMenuOpen ? (
                                <X aria-hidden="true" className="h-5 w-5" />
                            ) : (
                                <Menu aria-hidden="true" className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div
                    id="mobile-navigation"
                    className={`absolute inset-x-0 top-full border-b border-neutral-200 bg-white px-5 shadow-lg shadow-neutral-900/5 transition-[opacity,transform,visibility] duration-200 md:hidden ${
                        isMenuOpen
                            ? "visible translate-y-0 opacity-100"
                            : "invisible -translate-y-2 opacity-0"
                    }`}
                    aria-hidden={!isMenuOpen}
                >
                    <div className="mx-auto flex max-w-7xl flex-col py-3">
                        {sectionLinks.map(({ label, id }) => (
                            <a
                                key={id}
                                href={`/#${id}`}
                                tabIndex={isMenuOpen ? 0 : -1}
                                onClick={(event) =>
                                    handleSectionClick(event, id)
                                }
                                className="rounded-lg px-3 py-3 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
                            >
                                {label}
                            </a>
                        ))}
                        <Link
                            href="/booking/step-1"
                            tabIndex={isMenuOpen ? 0 : -1}
                            onClick={() => setIsMenuOpen(false)}
                            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                        >
                            Book a visit
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
