import React from "react";

type Props = { children?: React.ReactNode };

const Dropdown: React.FC<Props> & {
    Trigger: React.FC<{ children?: React.ReactNode }>;
    Content: React.FC<{ children?: React.ReactNode }>;
    Link: React.FC<any>;
} = ({ children }) => <div className="relative inline-block">{children}</div>;

Dropdown.Trigger = ({ children }) => <>{children}</>;
Dropdown.Content = ({ children }) => (
    <div className="absolute right-0 mt-2 z-50">{children}</div>
);

Dropdown.Link = ({ href, as, children, className, ...rest }: any) => {
    if (as === "button") {
        return (
            <button type="button" className={className} {...rest}>
                {children}
            </button>
        );
    }

    return (
        <a href={href} className={className} {...rest}>
            {children}
        </a>
    );
};

export default Dropdown;
