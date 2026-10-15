import React from "react";

export default function ResponsiveNavLink({
    href,
    as,
    method,
    active,
    children,
    className = "",
    ...rest
}: any) {
    if (as === "button") {
        return (
            <button
                type="button"
                className={`${className} block w-full text-left`}
                {...rest}
            >
                {children}
            </button>
        );
    }

    return (
        <a
            href={href}
            className={`${className} block w-full text-left`}
            {...rest}
        >
            {children}
        </a>
    );
}
