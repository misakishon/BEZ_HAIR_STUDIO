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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200">
            <div
                className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-200 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between pb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isDestructive
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                        >
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-stone-100">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-stone-300 mt-2 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-150 flex items-center gap-2 ${
                            isDestructive
                                ? "bg-red-600 hover:bg-red-500 shadow-red-950/40"
                                : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 shadow-amber-950/40"
                        } disabled:opacity-50`}
                    >
                        {isLoading && (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
