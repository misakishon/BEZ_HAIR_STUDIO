import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    value?: any;
    isFocused?: boolean;
}

const TextInput = React.forwardRef<HTMLInputElement, Props>(
    function TextInput(props, ref) {
        const { className, isFocused, ...rest } = props;
        return (
            <input {...(rest as any)} ref={ref} className={className || ""} />
        );
    },
);

export default TextInput;
