import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface AdminConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function AdminConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false,
    onConfirm,
    onCancel,
}: AdminConfirmModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="studio-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B18]/40 p-4 backdrop-blur-[2px]"
            onClick={() => !isLoading && onCancel()}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="studio-modal-panel w-full max-w-md rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] p-6 shadow-[0_16px_40px_rgba(28,27,24,0.14)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between pb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                                isDestructive
                                    ? "border-[#E9CECE] bg-[#F9ECEC] text-[#8E3535]"
                                    : "border-[#E5E2DA] bg-[#F3F1EC] text-[#1C1B18]"
                            }`}
                        >
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-semibold text-[#1C1B18]">
                            {title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg p-1 text-[#807D75] transition-colors hover:bg-[#EFECE5] hover:text-[#1C1B18]"
                        aria-label="Close modal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mt-2 mb-6 text-sm leading-relaxed text-[#5C5953]">
                    {message}
                </p>

                <div className="flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg border border-[#DCD8CE] bg-[#FDFCF9] px-4 py-2 text-xs font-semibold text-[#3D3B36] transition-all duration-150 hover:border-[#C2BDB1] hover:bg-[#F3F1EC] active:scale-[0.98]"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[#FAF9F5] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 ${
                            isDestructive
                                ? "bg-[#9E3B3B] hover:bg-[#853030]"
                                : "bg-[#252420] hover:bg-[#373530]"
                        }`}
                    >
                        {isLoading && (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
