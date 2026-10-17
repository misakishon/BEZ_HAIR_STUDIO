import React from "react";
import { Users, Scissors, Clock, Star, Sparkles, ShieldCheck } from "lucide-react";

interface StatItemData {
    icon: React.ReactNode;
    value: string;
    label: string;
    sublabel?: string;
}

const statsData: StatItemData[] = [
    {
        icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
        value: "500+",
        label: "Happy Clients",
        sublabel: "Active",
    },
    {
        icon: <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />,
        value: "Top Tier",
        label: "Master Barbers",
        sublabel: "Certified",
    },
    {
        icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
        value: "5+ Years",
        label: "Craft Experience",
        sublabel: "Proven",
    },
    {
        icon: <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500 text-amber-500" />,
        value: "4.9",
        label: "Customer Rating",
        sublabel: "★ Verified",
    },
    {
        icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
        value: "100%",
        label: "UV Sanitized Tools",
        sublabel: "Pristine",
    },
    {
        icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
        value: "Precision",
        label: "Signature Fades",
        sublabel: "Tailored",
    },
];

const StatCard: React.FC<{ item: StatItemData }> = ({ item }) => (
    <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 py-1.5 mx-2 rounded-xl bg-white border border-neutral-200/60 shadow-2xs hover:shadow-xs hover:border-amber-400/40 transition-all duration-200 group flex-shrink-0 cursor-default">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 transition-transform duration-200 group-hover:scale-105">
            {React.cloneElement(item.icon as React.ReactElement, {
                className: "w-3.5 h-3.5 sm:w-4 sm:h-4",
            })}
        </div>

        <div className="flex flex-col whitespace-nowrap">
            <div className="flex items-baseline gap-1">
                <span className="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight leading-none">
                    {item.value}
                </span>
                {item.sublabel && (
                    <span className="text-[8px] sm:text-[9px] font-semibold text-amber-600 uppercase tracking-wider">
                        {item.sublabel}
                    </span>
                )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium text-neutral-500 tracking-wide uppercase mt-0.5">
                {item.label}
            </span>
        </div>
    </div>
);

function StatsSection() {
    // Duplicate items so the animation loop is 100% seamless
    const marqueeItems = [...statsData, ...statsData];

    return (
        <section className="bg-white border-y border-neutral-200/70 py-1.5 sm:py-2 relative z-30 shadow-2xs overflow-hidden">
            {/* Left Edge Fade Mask */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />

            {/* Right Edge Fade Mask */}
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

            {/* Infinite Marquee Track moving to the left */}
            <div className="w-full overflow-hidden flex">
                <div className="animate-marquee-left flex items-center py-0.5">
                    {marqueeItems.map((item, index) => (
                        <StatCard key={index} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default StatsSection;

