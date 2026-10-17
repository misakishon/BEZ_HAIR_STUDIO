import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
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
    ShieldCheck,
} from "lucide-react";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        name: "Appointments",
        href: "/admin/appointments",
        icon: CalendarCheck,
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { url } = usePage();

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
        return url === href || url.startsWith(href + "/");
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="min-h-screen bg-[#f8f7f4] text-stone-900 flex flex-col lg:flex-row antialiased">
            {/* Mobile Menu Backdrop */}
            <div
                className={`
                    fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden
                    ${
                        isMobileMenuOpen
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Top Bar for Mobile */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0e0e10]/95 backdrop-blur-md border-b border-stone-800/80 px-4 h-16 flex items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-widest text-white">
                        BEZ<span className="text-amber-500">.</span>
                    </span>
                    <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        Admin
                    </span>
                </Link>

                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors"
                    aria-label="Toggle navigation menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="w-5 h-5 text-amber-400" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>
            </header>

            {/* Sidebar Desktop & Mobile Drawer */}
            <aside
                className={`
                    fixed top-0 bottom-0 z-50 bg-[#0e0e10] border-r border-stone-800/80
                    flex flex-col transition-all duration-300 ease-in-out
                    ${
                        isCollapsed
                            ? "lg:w-20 w-72"
                            : "lg:w-64 w-72"
                    }
                    ${
                        isMobileMenuOpen
                            ? "translate-x-0 shadow-2xl"
                            : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                {/* Brand Logo & Studio Header */}
                <div
                    className={`h-16 px-4 flex items-center border-b border-stone-800/80 ${
                        isCollapsed ? "justify-center" : "justify-between"
                    }`}
                >
                    <Link
                        href="/admin/dashboard"
                        className={`flex items-center gap-2.5 transition-opacity ${
                            isCollapsed ? "justify-center" : ""
                        }`}
                        title="BEZ Hair Studio Admin"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/40 font-bold text-stone-950 flex-shrink-0">
                            B
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-base font-bold tracking-wider text-white leading-tight">
                                    BEZ<span className="text-amber-400">.</span>
                                </span>
                                <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 font-medium">
                                    HAIR STUDIO
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                    <div className="px-3 pb-2">
                        {!isCollapsed && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-300">
                                Menu
                            </span>
                        )}
                    </div>

                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const IconComponent = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${
                                        active
                                            ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border-l-2 border-amber-500 shadow-sm font-semibold"
                                            : "text-stone-400 hover:text-stone-100 hover:bg-stone-900/60"
                                    }
                                    ${isCollapsed ? "justify-center px-2" : ""}
                                `}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <IconComponent
                                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                        active
                                            ? "text-amber-400"
                                            : "text-stone-400 group-hover:text-amber-400"
                                    }`}
                                />
                                {!isCollapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Quick Link to Public Studio */}
                    <div className="pt-4 mt-4 border-t border-stone-800/80">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                                flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900/40 transition-colors
                                ${isCollapsed ? "justify-center px-2" : ""}
                            `}
                            title={isCollapsed ? "View Public Storefront" : undefined}
                        >
                            <ExternalLink className="w-4 h-4 flex-shrink-0 text-stone-400" />
                            {!isCollapsed && <span>Live Storefront</span>}
                        </a>
                    </div>
                </nav>

                {/* Admin Profile Footer */}
                <div className="p-3 border-t border-stone-800/80 bg-stone-950/60">
                    <div
                        className={`flex items-center gap-3 p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 ${
                            isCollapsed ? "justify-center" : ""
                        }`}
                    >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-stone-200 truncate">
                                    Studio Manager
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Super Admin
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={`
                    flex-1 flex flex-col min-w-0 transition-all duration-300
                    pt-16 lg:pt-0
                    ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}
                `}
            >
                {children}
            </div>
        </div>
    );
}
