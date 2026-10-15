import React from "react";

export default function InputError({
    message,
    className,
}: {
    message?: string | null;
    className?: string;
}) {
    if (!message) return null;
    return <p className={className || "text-sm text-red-600"}>{message}</p>;
}
