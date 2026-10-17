import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    className?: string;
}

const steps = [
    { id: 1, name: "Barber" },
    { id: 2, name: "Date & time" },
    { id: 3, name: "Your details" },
    { id: 4, name: "Payment" },
];

const stepCopy: Record<number, { title: string; description: string }> = {
    1: {
        title: "Choose your barber",
        description: "Pick your preferred barber or let us find the right fit.",
    },
    2: {
        title: "Find a time that works",
        description: "Choose an open date and appointment time.",
    },
    3: {
        title: "Your contact details",
        description: "Tell us how to reach you with appointment updates.",
    },
    4: {
        title: "Choose how to pay",
        description: "Review your appointment and select a payment method.",
    },
};

const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    className = "",
}) => {
    const copy = stepCopy[currentStep] ?? stepCopy[1];

    return (
        <section
            aria-label={`Booking step ${currentStep} of ${steps.length}`}
            className={`mb-8 sm:mb-10 ${className}`}
        >
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-800">
                Your appointment
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
                {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600 sm:text-base">
                {copy.description}
            </p>

            <ol className="mt-6 flex items-start rounded-2xl border border-neutral-200 bg-white px-3 py-4 shadow-sm sm:px-6">
                {steps.map((step, index) => {
                    const isComplete = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                        <li
                            key={step.id}
                            className="flex min-w-0 flex-1 items-start last:flex-none"
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                                        isComplete
                                            ? "bg-neutral-950 text-white"
                                            : isCurrent
                                              ? "bg-amber-500 text-neutral-950 ring-4 ring-amber-100"
                                              : "bg-neutral-100 text-neutral-500"
                                    }`}
                                >
                                    {isComplete ? (
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4"
                                        />
                                    ) : (
                                        step.id
                                    )}
                                </span>
                                <span
                                    className={`sr-only truncate text-xs sm:not-sr-only sm:block sm:text-sm ${
                                        isCurrent
                                            ? "font-semibold text-neutral-950"
                                            : isComplete
                                              ? "font-medium text-neutral-700"
                                              : "text-neutral-400"
                                    }`}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className={`mx-2 mt-4 h-px min-w-3 flex-1 sm:mx-4 ${
                                        isComplete
                                            ? "bg-neutral-950"
                                            : "bg-neutral-200"
                                    }`}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
            <p className="mt-2 text-right text-xs text-neutral-500 sm:hidden">
                Step {currentStep} of {steps.length}
            </p>
        </section>
    );
};

export default StepIndicator;
