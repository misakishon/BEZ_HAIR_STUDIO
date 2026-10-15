import React from "react";

interface StepIndicatorProps {
    currentStep: number;
    className?: string; // Add className prop for custom styling
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep = 1,
    className = "",
}) => {
    const steps = [
        { id: 1, name: "Barber" },
        { id: 2, name: "Date & Time" },
        { id: 3, name: "Contact" },
        { id: 4, name: "Payment" },
    ];

    return (
        <div className={`w-full max-w-3xl mx-auto px-2 ${className}`}>
            <div className="flex items-center justify-between gap-1">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center relative">
                            {/* Step Circle */}
                            <div
                                className={`
                                    w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300
                                    ${
                                        currentStep > step.id
                                            ? "bg-black text-white"
                                            : currentStep === step.id
                                              ? "bg-amber-600 text-white shadow-md scale-105"
                                              : "bg-gray-100 text-gray-400"
                                    }
                                `}
                            >
                                {currentStep > step.id ? (
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    step.id
                                )}
                            </div>

                            {/* Step Label */}
                            <span
                                className={`
                                    text-[9px] uppercase tracking-wider mt-1 font-medium
                                    ${currentStep >= step.id ? "text-black" : "text-gray-400"}
                                `}
                            >
                                {step.name === "Date & Time"
                                    ? "Date"
                                    : step.name}
                            </span>
                        </div>

                        {/* Connecting Line */}
                        {idx < steps.length - 1 && (
                            <div
                                className={`
                                    flex-1 h-[1.5px] mx-1 transition-all duration-300
                                    ${currentStep > step.id ? "bg-amber-600" : "bg-gray-200"}
                                `}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
