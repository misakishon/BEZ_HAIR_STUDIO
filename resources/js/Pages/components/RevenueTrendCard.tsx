import React, { useState } from "react";

export interface MonthlyData {
    month: string;
    revenue: number;
    bookings: number;
}

const defaultData: MonthlyData[] = [
    { month: "Jan", revenue: 0, bookings: 0 },
    { month: "Feb", revenue: 0, bookings: 0 },
    { month: "Mar", revenue: 0, bookings: 0 },
    { month: "Apr", revenue: 0, bookings: 0 },
    { month: "May", revenue: 0, bookings: 0 },
    { month: "Jun", revenue: 0, bookings: 0 },
    { month: "Jul", revenue: 0, bookings: 0 },
    { month: "Aug", revenue: 0, bookings: 0 },
    { month: "Sep", revenue: 0, bookings: 0 },
    { month: "Oct", revenue: 0, bookings: 0 },
    { month: "Nov", revenue: 0, bookings: 0 },
    { month: "Dec", revenue: 0, bookings: 0 },
];

export default function RevenueTrendCard({
    data = defaultData,
    growthPercentage = 0,
}: {
    data?: MonthlyData[];
    growthPercentage?: number;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);

    // Dynamic Y-Axis ceiling (minimum 800 so empty/low states stay balanced)
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 800);
    const yTicks = [
        maxRevenue,
        maxRevenue * 0.75,
        maxRevenue * 0.5,
        maxRevenue * 0.25,
        0,
    ];

    const svgWidth = 1000;
    const svgHeight = 220;
    const padX = 20;
    const padTop = 16;
    const padBottom = 20;
    const chartW = svgWidth - padX * 2;
    const chartH = svgHeight - padTop - padBottom;

    const getPoints = (key: "revenue" | "bookings", maxVal: number) =>
        data.map((d, i) => ({
            x: padX + (i / Math.max(data.length - 1, 1)) * chartW,
            y: padTop + chartH - (maxVal > 0 ? (d[key] / maxVal) * chartH : 0),
        }));

    const revPoints = getPoints("revenue", maxRevenue);
    const maxBookings = Math.max(...data.map((d) => d.bookings), 8);
    const bookPoints = getPoints("bookings", maxBookings);

    const buildSmoothPath = (pts: { x: number; y: number }[]) => {
        if (pts.length === 0) return "";
        let path = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const midX = (p0.x + p1.x) / 2;
            path += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
        }
        return path;
    };

    const revLinePath = buildSmoothPath(revPoints);
    const revAreaPath =
        revPoints.length > 0
            ? `${revLinePath} L ${revPoints[revPoints.length - 1].x},${
                  padTop + chartH
              } L ${revPoints[0].x},${padTop + chartH} Z`
            : "";
    const bookLinePath = buildSmoothPath(bookPoints);

    return (
        <div className="w-full rounded-xl border border-[#E5E2DA] bg-[#FDFCF9] p-5 shadow-[0_1px_2px_rgba(28,27,24,0.03)] transition-colors duration-200 hover:border-[#D8D4CB] sm:p-6">
            {/* Top Header & Legend */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EFECE5] pb-6">
                <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#918E85]">
                        Annual Revenue Trend
                    </span>

                    <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
                        <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18] tabular-nums sm:text-3xl">
                            ₱
                            {totalRevenue.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </h2>

                        <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums ${
                                growthPercentage > 0
                                    ? "border-[#D2E0D0] bg-[#EDF3EC] text-[#2E5A36]"
                                    : growthPercentage < 0
                                      ? "border-[#E9CECE] bg-[#F9ECEC] text-[#8E3535]"
                                      : "border-[#E5E2DA] bg-[#F3F1EC] text-[#5C5953]"
                            }`}
                        >
                            {growthPercentage >= 0 ? "↑" : "↓"}{" "}
                            {Math.abs(growthPercentage)}% MoM
                        </span>

                        <span className="text-xs font-medium text-[#737069] tabular-nums">
                            {totalBookings}{" "}
                            {totalBookings === 1 ? "booking" : "bookings"} this year
                        </span>
                    </div>
                </div>

                {/* Warm Studio Legend */}
                <div className="flex items-center gap-5 rounded-lg border border-[#E5E2DA] bg-[#F5F4EF] px-3.5 py-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#252420]">
                        <span className="h-2 w-2 rounded-full bg-[#252420]" />
                        Revenue
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#737069]">
                        <span className="h-0.5 w-3.5 border-t-2 border-dashed border-[#8D8980]" />
                        Bookings
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative mt-5 flex">
                {/* Left Y-Axis Labels */}
                <div
                    className="flex select-none flex-col justify-between pr-3 text-right text-[11px] font-medium text-[#918E85] tabular-nums"
                    style={{
                        height: `${svgHeight}px`,
                        paddingTop: `${padTop - 6}px`,
                        paddingBottom: `${padBottom - 6}px`,
                    }}
                >
                    {yTicks.map((val, idx) => (
                        <span key={idx}>₱{Math.round(val).toLocaleString()}</span>
                    ))}
                </div>

                {/* Plot Container */}
                <div className="relative min-w-0 flex-1">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full overflow-visible"
                        style={{ height: `${svgHeight}px` }}
                    >
                        <defs>
                            <linearGradient
                                id="revenueWarmGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#252420"
                                    stopOpacity="0.09"
                                />
                                <stop
                                    offset="80%"
                                    stopColor="#252420"
                                    stopOpacity="0.02"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#252420"
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Grid Lines */}
                        {yTicks.map((_, idx) => {
                            const y =
                                padTop +
                                (idx / (yTicks.length - 1)) * chartH;
                            return (
                                <line
                                    key={idx}
                                    x1={padX}
                                    y1={y}
                                    x2={svgWidth - padX}
                                    y2={y}
                                    stroke="#EDEAE3"
                                    strokeWidth="1"
                                    strokeDasharray={
                                        idx === yTicks.length - 1
                                            ? undefined
                                            : "4 4"
                                    }
                                />
                            );
                        })}

                        {/* Bookings Secondary Dashed Line */}
                        <path
                            d={bookLinePath}
                            fill="none"
                            stroke="#8D8980"
                            strokeWidth="1.75"
                            strokeDasharray="4 4"
                            opacity="0.75"
                        />

                        {/* Revenue Area & Soft Charcoal Line */}
                        <path d={revAreaPath} fill="url(#revenueWarmGrad)" />
                        <path
                            d={revLinePath}
                            fill="none"
                            stroke="#252420"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                        />

                        {/* Smooth Hover Guide Line */}
                        {hoveredIndex !== null && revPoints[hoveredIndex] && (
                            <line
                                x1={revPoints[hoveredIndex].x}
                                y1={padTop}
                                x2={revPoints[hoveredIndex].x}
                                y2={padTop + chartH}
                                stroke="#B8B3A8"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                                className="transition-all duration-150 ease-out"
                            />
                        )}

                        {/* Soft Charcoal Data Points */}
                        {revPoints.map((pt, i) => {
                            const isHovered = hoveredIndex === i;
                            const hasValue = data[i].revenue > 0;
                            return (
                                <circle
                                    key={i}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={isHovered ? 5 : hasValue ? 3.5 : 2.5}
                                    fill={isHovered ? "#252420" : "#FDFCF9"}
                                    stroke="#252420"
                                    strokeWidth={isHovered ? 2.25 : 1.75}
                                    className="transition-all duration-150 ease-out"
                                />
                            );
                        })}

                        {/* Invisible Hover Columns */}
                        {revPoints.map((pt, i) => {
                            const colWidth = chartW / Math.max(data.length, 1);
                            return (
                                <rect
                                    key={i}
                                    x={pt.x - colWidth / 2}
                                    y={padTop}
                                    width={colWidth}
                                    height={chartH}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                />
                            );
                        })}
                    </svg>

                    {/* Gliding Floating Tooltip */}
                    {hoveredIndex !== null &&
                        revPoints[hoveredIndex] &&
                        data[hoveredIndex] && (
                            <div
                                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[#373530] bg-[#252420] px-3 py-2 text-xs text-[#FAF9F5] shadow-[0_8px_20px_rgba(28,27,24,0.16)] transition-[left,top,opacity] duration-150 ease-out"
                                style={{
                                    left: `${
                                        (revPoints[hoveredIndex].x / svgWidth) *
                                        100
                                    }%`,
                                    top: `${Math.max(
                                        revPoints[hoveredIndex].y - 12,
                                        12,
                                    )}px`,
                                }}
                            >
                                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#B8B3A8]">
                                    {data[hoveredIndex].month}
                                </div>
                                <div className="flex items-center justify-between gap-4 tabular-nums">
                                    <span className="text-[#D4D0C7]">
                                        Revenue
                                    </span>
                                    <span className="font-semibold text-[#FAF9F5]">
                                        ₱
                                        {data[
                                            hoveredIndex
                                        ].revenue.toLocaleString()}
                                    </span>
                                </div>
                                <div className="mt-0.5 flex items-center justify-between gap-4 tabular-nums">
                                    <span className="text-[#D4D0C7]">
                                        Bookings
                                    </span>
                                    <span className="font-semibold text-[#FAF9F5]">
                                        {data[hoveredIndex].bookings}
                                    </span>
                                </div>
                            </div>
                        )}

                    {/* Bottom X-Axis Month Labels */}
                    <div className="mt-2 flex justify-between px-3 text-[11px]">
                        {data.map((item, idx) => (
                            <span
                                key={item.month}
                                className={`font-medium transition-colors duration-150 ${
                                    hoveredIndex === idx
                                        ? "font-semibold text-[#1C1B18]"
                                        : "text-[#918E85]"
                                }`}
                            >
                                {item.month}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
