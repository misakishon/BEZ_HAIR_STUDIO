import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";

const navItems = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: "dashboard",
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: "people",
    },
    {
        name: "Appointments",
        href: "/admin/appointments",
        icon: "event",
    },
    {
        name: "Barbers",
        href: "/admin/barbers",
        icon: "content_cut",
    },
    {
        name: "Hairstyles",
        href: "/admin/hairstyles",
        icon: "style",
    },
];

interface SidebarProps {
    children?: React.ReactNode;
}

function Sidebar({ children }: SidebarProps) {
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

    // Toggle sidebar collapse
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            {/* Mobile Menu Overlay */}
            <div
                className={`
                    fixed inset-0 bg-black/50 z-40 transition-all duration-300 lg:hidden
                    ${isMobileMenuOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="lg:flex lg:min-h-screen">
                {/* Sidebar */}
                <aside
                    className={`
                        fixed top-0 h-full bg-white border-r border-gray-200 z-50 
                        transition-all duration-300 ease-in-out
                        ${isCollapsed ? "lg:w-20 w-full max-w-xs" : "lg:w-64 w-full max-w-xs"}
                        right-0 lg:right-auto left-auto lg:left-0
                        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
                        ${isMobileMenuOpen ? "shadow-xl" : ""}
                    `}
                >
                    {/* Logo Section */}
                    <div
                        className={`hidden lg:flex items-center ${isCollapsed ? "justify-center" : "justify-between"} h-16 px-4 border-b border-gray-200`}
                    >
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <div className="text-xl font-bold tracking-tight">
                                    <span className="text-black">BEZ</span>
                                    <span className="text-amber-600">.</span>
                                    <span className="text-gray-400 text-sm font-normal ml-1">
                                        Admin
                                    </span>
                                </div>
                                <div className="text-[9px] tracking-[0.3em] text-gray-400 uppercase">
                                    Panel
                                </div>
                            </div>
                        )}
                        {isCollapsed && (
                            <div className="text-xl font-bold tracking-tight">
                                <span className="text-black">BEZ</span>
                                <span className="text-amber-600">.</span>
                            </div>
                        )}

                        {/* Toggle Button */}
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <span className="material-symbols-outlined text-base">
                                {isCollapsed ? "chevron_right" : "chevron_left"}
                            </span>
                        </button>
                    </div>

                    {/* Mobile Header for smaller screens */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
                        <div>
                            <div className="text-sm font-semibold tracking-[0.16em] text-black uppercase">
                                BEZ.
                            </div>
                            <div className="text-[9px] tracking-[0.5em] text-gray-500 uppercase mt-1">
                                Admin Panel
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-4 lg:space-y-1 overflow-y-auto h-full lg:h-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                    ${
                                        isActive(item.href)
                                            ? "bg-black text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-black"
                                    }
                                    ${isCollapsed ? "justify-center px-2" : ""}
                                `}
                                title={isCollapsed ? item.name : ""}
                            >
                                <span className="material-symbols-outlined text-base">
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        ))}

                        {/* Bottom Section - User Profile */}
                        <div
                            className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 ${isCollapsed ? "text-center" : ""} lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:border-t-transparent`}
                        >
                            <div
                                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-gray-500">
                                        admin_panel_settings
                                    </span>
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">
                                            Admin User
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            Administrator
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-4">
                        <div className="text-lg font-light tracking-[0.35em] uppercase text-black leading-none">
                            B E Z<span className="font-normal">.</span>
                        </div>
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none"
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

                <div
                    className={`transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"} flex-1 pt-16 lg:pt-0`}
                >
                    {children}
                </div>
            </div>
        </>
    );
}

export default Sidebar;
