import React from "react";

export default function DangerButton({
    children,
    ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...rest}
            className={
                (rest.className || "") +
                " px-3 py-2 bg-red-600 text-white rounded"
            }
        >
            {children}
        </button>
    );
}
