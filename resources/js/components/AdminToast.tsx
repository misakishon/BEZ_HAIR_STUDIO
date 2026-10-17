import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
    id?: string;
    type: "success" | "error" | "info";
    text: string;
}

interface AdminToastProps {
    toast: ToastMessage | null;
    onClose: () => void;
    duration?: number;
}

export default function AdminToast({
    toast,
    onClose,
    duration = 4000,
}: AdminToastProps) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [toast, duration, onClose]);

    if (!toast) return null;

    const isSuccess = toast.type === "success";
    const isError = toast.type === "error";

    return (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full transition-all duration-300 ease-out transform translate-y-0 opacity-100">
            <div
                className={`
                    flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border text-sm
                    ${
                        isSuccess
                            ? "bg-stone-900/95 text-stone-100 border-amber-500/30 shadow-amber-950/20"
                            : isError
                            ? "bg-red-950/95 text-red-100 border-red-500/30 shadow-red-950/30"
                            : "bg-stone-900/95 text-stone-100 border-stone-700 shadow-stone-950/30"
                    }
                `}
            >
                <div className="flex-shrink-0 mt-0.5">
                    {isSuccess && (
                        <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    )}
                    {isError && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    {!isSuccess && !isError && (
                        <Info className="w-5 h-5 text-stone-400" />
                    )}
                </div>

                <div className="flex-1 pr-2">
                    <p className="font-medium leading-snug">{toast.text}</p>
                </div>

                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-stone-400 hover:text-stone-200 transition-colors p-0.5 rounded-lg hover:bg-white/10"
                    aria-label="Dismiss notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
