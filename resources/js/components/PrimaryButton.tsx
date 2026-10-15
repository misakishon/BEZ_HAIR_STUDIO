import React from "react";

export default function PrimaryButton({
    children,
    ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...rest}
            className={
                (rest.className || "") +
                " px-4 py-2 bg-black text-white rounded"
            }
        >
            {children}
        </button>
    );
}
