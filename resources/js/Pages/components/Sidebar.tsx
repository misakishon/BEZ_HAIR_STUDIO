import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Scissors,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    ExternalLink,
    LogOut,
    ShieldCheck,
} from "lucide-react";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_STORAGE_KEY = "bez_admin_sidebar_collapsed";

const navItems: NavItem[] = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Appointments",
        href: "/admin/appointments",
        icon: CalendarCheck,
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        name: "Barbers",
        href: "/admin/barbers",
        icon: Scissors,
    },
    {
        name: "Hairstyles",
        href: "/admin/hairstyles",
        icon: Sparkles,
    },
];

interface SidebarProps {
    children?: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const page = usePage();
    const url = page.url || "";
    const authUser = (page.props as {
        auth?: {
            user?: {
                first_name?: string;
                last_name?: string;
                email?: string;
            } | null;
        };
    })?.auth?.user;

    const adminDisplayName =
        authUser?.first_name || authUser?.last_name
            ? `${authUser.first_name || ""} ${authUser.last_name || ""}`.trim()
            : "Studio Manager";
    const adminEmail = authUser?.email || "Admin";

    // Subtle Inertia navigation progress feedback
    useEffect(() => {
        const stopStart = router.on("start", () => setIsNavigating(true));
        const stopFinish = router.on("finish", () => setIsNavigating(false));
        return () => {
            stopStart();
            stopFinish();
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [url]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    const isActive = (href: string) => {
        const pathname = url.split("?")[0];
        return pathname === href || pathname.startsWith(href + "/");
    };

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                window.localStorage.setItem(
                    SIDEBAR_STORAGE_KEY,
                    next ? "1" : "0",
                );
            }
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#1C1B18] antialiased">
            {/* Whisper-thin route navigation progress bar */}
            <div
                aria-hidden="true"
                className={`pointer-events-none fixed top-0 left-0 right-0 z-[70] h-[2px] origin-left bg-[#252420] transition-all duration-300 ease-out ${
                    isNavigating
                        ? "scale-x-100 opacity-90"
                        : "scale-x-0 opacity-0"
                }`}
            />

            {/* Mobile Menu Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-[#1C1B18]/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out lg:hidden ${
                    isMobileMenuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Top Bar for Mobile */}
            <header className="fixed top-0 left-0 right-0 z-40 flex h-[68px] items-center justify-between border-b border-[#E5E2DA] bg-[#FDFCF9]/95 px-4 backdrop-blur-md lg:hidden">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 leading-none"
                >
                    <div className="flex flex-col leading-none">
                        <span className="font-morche text-xl font-semibold tracking-[0.22em] text-[#1C1B18]">
                            BEZ.
                        </span>
                        <span className="mt-1 font-morche text-[9px] font-medium uppercase tracking-[0.34em] text-[#737069]">
                            Hair Studio
                        </span>
                    </div>
                    <span className="rounded-md border border-[#E5E2DA] bg-[#F3F1EC] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5C5953]">
                        Admin
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E2DA] bg-[#FDFCF9] text-[#1C1B18] transition-all duration-200 hover:border-[#C9C4B8] hover:bg-[#F3F1EC] active:scale-[0.97]"
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMobileMenuOpen}
                >
                    {isMobileMenuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </header>

            {/* Sidebar Desktop Rail & Mobile Drawer */}
            <aside
                aria-label="Admin sidebar navigation"
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#E5E2DA] bg-[#FDFCF9] transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isCollapsed ? "w-72 lg:w-20" : "w-72 lg:w-64"
                } ${
                    isMobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Edge Collapse Toggle (Desktop) */}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-3 top-[22px] z-10 h-6 w-6 items-center justify-center rounded-md border border-[#E5E2DA] bg-[#FDFCF9] text-[#737069] shadow-[0_1px_2px_rgba(28,27,24,0.05)] transition-all duration-200 hover:border-[#252420] hover:text-[#1C1B18] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252420]"
                    aria-label={
                        isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronLeft className="h-3.5 w-3.5" />
                    )}
                </button>

                {/* Brand Logo & Studio Header */}
                <div
                    className={`flex h-[68px] shrink-0 items-center border-b border-[#E5E2DA] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isCollapsed ? "justify-center px-3" : "justify-between px-5"
                    }`}
                >
                    <Link
                        href="/admin/dashboard"
                        className={`group flex items-center ${
                            isCollapsed ? "justify-center" : "gap-3"
                        }`}
                        title="BEZ Hair Studio Admin"
                    >
                        {isCollapsed ? (
                            <span className="font-morche text-xl font-semibold tracking-[0.12em] text-[#1C1B18] transition-opacity duration-200 group-hover:opacity-75">
                                B.
                            </span>
                        ) : (
                            <div className="flex flex-col leading-none">
                                <span className="font-morche text-xl font-semibold tracking-[0.22em] text-[#1C1B18] transition-opacity duration-200 group-hover:opacity-75">
                                    BEZ.
                                </span>
                                <span className="mt-1.5 font-morche text-[9px] font-medium uppercase tracking-[0.34em] text-[#737069]">
                                    Hair Studio
                                </span>
                            </div>
                        )}
                    </Link>

                    {!isCollapsed && (
                        <span className="hidden lg:inline-flex items-center rounded-md border border-[#E5E2DA] bg-[#F3F1EC] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5C5953]">
                            Admin
                        </span>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E2DA] text-[#5C5953] transition-colors hover:border-[#252420] hover:text-[#1C1B18] lg:hidden"
                        aria-label="Close navigation menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="studio-scrollbar flex-1 overflow-y-auto px-3 py-5">
                    {!isCollapsed && (
                        <div className="mb-2 px-3">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#918E85]">
                                Navigation
                            </span>
                        </div>
                    )}

                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            const IconComponent = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    title={isCollapsed ? item.name : undefined}
                                    aria-current={active ? "page" : undefined}
                                    className={`group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98] ${
                                        isCollapsed
                                            ? "mx-auto h-10 w-10 justify-center p-0"
                                            : "gap-3 px-3 py-2.5"
                                    } ${
                                        active
                                            ? "bg-[#252420] text-[#FAF9F5] shadow-[0_1px_2px_rgba(28,27,24,0.08)]"
                                            : "text-[#5C5953] hover:bg-[#EFECE5] hover:text-[#1C1B18]"
                                    }`}
                                >
                                    <IconComponent
                                        className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                                            active
                                                ? "text-[#FAF9F5]"
                                                : "text-[#807D75] group-hover:text-[#1C1B18]"
                                        }`}
                                    />
                                    <span
                                        className={`truncate transition-all duration-200 ${
                                            isCollapsed
                                                ? "max-w-0 opacity-0 hidden"
                                                : "max-w-[160px] opacity-100"
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Storefront Quick Link */}
                    <div className="mt-6 border-t border-[#E5E2DA] pt-4">
                        {!isCollapsed && (
                            <div className="mb-2 px-3">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#918E85]">
                                    Public Site
                                </span>
                            </div>
                        )}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={
                                isCollapsed ? "Live Storefront" : undefined
                            }
                            className={`group flex items-center rounded-lg text-sm font-medium text-[#5C5953] transition-all duration-200 hover:bg-[#EFECE5] hover:text-[#1C1B18] active:scale-[0.98] ${
                                isCollapsed
                                    ? "mx-auto h-10 w-10 justify-center p-0"
                                    : "gap-3 px-3 py-2.5"
                            }`}
                        >
                            <ExternalLink className="h-[18px] w-[18px] shrink-0 text-[#807D75] transition-colors group-hover:text-[#1C1B18]" />
                            {!isCollapsed && (
                                <span className="truncate">Live Storefront</span>
                            )}
                        </a>
                    </div>
                </nav>

                {/* Admin Profile & Sign Out Footer */}
                <div className="shrink-0 border-t border-[#E5E2DA] bg-[#FDFCF9] p-3">
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E2DA] bg-[#F3F1EC] text-[#1C1B18]"
                                title={`${adminDisplayName} (${adminEmail})`}
                            >
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <Link
                                href="/admin/logout"
                                method="post"
                                as="button"
                                type="button"
                                title="Sign out"
                                aria-label="Sign out"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E2DA] text-[#5C5953] transition-all duration-200 hover:border-[#252420] hover:bg-[#252420] hover:text-[#FAF9F5] active:scale-[0.97]"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 rounded-lg border border-[#E5E2DA] bg-[#F5F4EF] p-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#252420] text-[#FAF9F5]">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-xs font-semibold text-[#1C1B18]">
                                        {adminDisplayName}
                                    </div>
                                    <div className="truncate text-[11px] text-[#737069]">
                                        {adminEmail}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/admin/logout"
                                method="post"
                                as="button"
                                type="button"
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E2DA] bg-[#FDFCF9] px-3 py-2 text-xs font-semibold text-[#3D3B36] transition-all duration-200 hover:border-[#252420] hover:bg-[#252420] hover:text-[#FAF9F5] active:scale-[0.98]"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Sign Out</span>
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Shell */}
            <div
                className={`min-h-screen w-full min-w-0 pt-[68px] transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:pt-0 ${
                    isCollapsed ? "lg:pl-20" : "lg:pl-64"
                }`}
            >
                {children}
            </div>
        </div>
    );
}
