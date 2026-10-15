import React, { useEffect } from "react";

interface StatItemProps {
    icon: string;
    value: string;
    label: string;
    isRating?: boolean;
}

// Reusable Stat Item Component
const StatItem: React.FC<StatItemProps> = ({
    icon,
    value,
    label,
    isRating = false,
}) => {
    return (
        <div className="stat-card flex items-center justify-center gap-2.5 md:gap-3.5 w-full cursor-pointer group transition-all duration-300 hover:translate-y-[-2px]">
            {isRating ? (
                <div className="flex text-amber-400 select-none gap-0.5 md:gap-1">
                    <span className="material-symbols-outlined text-lg md:text-2xl">
                        star
                    </span>
                </div>
            ) : (
                <span className="material-symbols-outlined text-[22px] md:text-[28px] text-gray-700 select-none align-middle">
                    {icon}
                </span>
            )}

            <div>
                <div className="font-bold text-base md:text-lg text-gray-900 leading-none mb-1">
                    {value}
                </div>
                <div className="text-[9px] md:text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    {label}
                </div>
            </div>
        </div>
    );
};

function StatsSection() {
    useEffect(() => {
        // Ensure Material Symbols are loaded
        const linkExists = document.querySelector(
            'link[href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"]',
        );

        if (!linkExists) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
                "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
            document.head.appendChild(link);
        }
    }, []);

    return (
        <section className="bg-white border-b border-gray-100 py-6 md:py-8 relative z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Stats Grid - Centered items with uniform grid tracks */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 md:gap-8 items-center justify-items-center">
                    {/* Happy Clients */}
                    <StatItem
                        icon="visibility"
                        value="500+"
                        label="Happy Clients"
                    />

                    {/* Expert Barbers */}
                    <StatItem
                        icon="handshake"
                        value="1"
                        label="Expert Barbers"
                    />

                    {/* Years Experience */}
                    <StatItem
                        icon="schedule"
                        value="5"
                        label="Years Experience"
                    />

                    {/* Client Rating */}
                    <StatItem
                        icon="star"
                        value="4.9"
                        label="Client Rating"
                        isRating={true}
                    />
                </div>
            </div>
        </section>
    );
}

export default StatsSection;
