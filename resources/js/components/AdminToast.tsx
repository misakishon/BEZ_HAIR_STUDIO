import React, { useEffect, useState } from "react";
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
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (!toast) {
            setIsLeaving(false);
            return;
        }
        setIsLeaving(false);

        const fadeTimer = setTimeout(() => {
            setIsLeaving(true);
        }, Math.max(duration - 220, 400));

        const closeTimer = setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(closeTimer);
        };
    }, [toast, duration, onClose]);

    if (!toast) return null;

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose();
        }, 180);
    };

    const isSuccess = toast.type === "success";
    const isError = toast.type === "error";

    return (
        <div
            role="status"
            aria-live="polite"
            className={`studio-toast-enter fixed top-5 right-5 z-50 w-full max-w-sm transition-all duration-200 ease-out ${
                isLeaving
                    ? "translate-y-[-6px] scale-[0.98] opacity-0"
                    : "translate-y-0 scale-100 opacity-100"
            }`}
        >
            <div
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm shadow-[0_8px_24px_rgba(28,27,24,0.12)] ${
                    isSuccess
                        ? "border-[#33312C] bg-[#252420] text-[#FAF9F5]"
                        : isError
                          ? "border-[#E3C1C1] bg-[#FDF5F5] text-[#7D2E2E]"
                          : "border-[#E5E2DA] bg-[#FDFCF9] text-[#1C1B18]"
                }`}
            >
                <div className="mt-0.5 shrink-0">
                    {isSuccess && (
                        <CheckCircle2 className="h-4 w-4 text-[#A7D3AF]" />
                    )}
                    {isError && (
                        <AlertCircle className="h-4 w-4 text-[#A63D3D]" />
                    )}
                    {!isSuccess && !isError && (
                        <Info className="h-4 w-4 text-[#5C5953]" />
                    )}
                </div>

                <div className="flex-1 pr-2">
                    <p className="font-medium leading-snug">{toast.text}</p>
                </div>

                <button
                    type="button"
                    onClick={handleClose}
                    className={`shrink-0 rounded-md p-0.5 transition-colors ${
                        isSuccess
                            ? "text-[#B8B3A8] hover:bg-white/10 hover:text-[#FAF9F5]"
                            : isError
                              ? "text-[#A66A6A] hover:bg-[#F4DFDF] hover:text-[#7D2E2E]"
                              : "text-[#807D75] hover:bg-[#EFECE5] hover:text-[#1C1B18]"
                    }`}
                    aria-label="Dismiss notification"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
