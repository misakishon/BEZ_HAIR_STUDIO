import React from "react";

interface Props {
    children: React.ReactNode;
    open?: boolean;
    onClose?: () => void;
}

export default function Modal({ children, open = true, onClose }: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                {children}
            </div>
        </div>
    );
}
