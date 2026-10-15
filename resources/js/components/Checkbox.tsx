import React from "react";

export default function Checkbox(
    props: React.InputHTMLAttributes<HTMLInputElement>,
) {
    return <input type="checkbox" {...props} />;
}
