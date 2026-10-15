import React from "react";

interface Props {
    htmlFor?: string;
    value?: React.ReactNode;
    className?: string;
}

export default function InputLabel({ htmlFor, value, className }: Props) {
    return (
        <label
            htmlFor={htmlFor}
            className={className || "block text-sm font-medium text-gray-700"}
        >
            {value}
        </label>
    );
}
