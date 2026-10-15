import React from "react";

export default function NavLink({
    href,
    active,
    children,
    className = "",
}: any) {
    const base = "text-sm font-medium";
    const activeClass = active ? "text-gray-900" : "text-gray-500";
    return (
        <a href={href} className={`${base} ${activeClass} ${className}`}>
            {children}
        </a>
    );
}
