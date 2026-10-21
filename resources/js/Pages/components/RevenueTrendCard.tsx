import React, { useState } from 'react';

export interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

const defaultData: MonthlyData[] = [
  { month: 'Jan', revenue: 0, bookings: 0 },
  { month: 'Feb', revenue: 0, bookings: 0 },
  { month: 'Mar', revenue: 0, bookings: 0 },
  { month: 'Apr', revenue: 0, bookings: 0 },
  { month: 'May', revenue: 0, bookings: 0 },
  { month: 'Jun', revenue: 0, bookings: 0 },
  { month: 'Jul', revenue: 0, bookings: 0 },
  { month: 'Aug', revenue: 800, bookings: 4 },
  { month: 'Sep', revenue: 0, bookings: 0 },
  { month: 'Oct', revenue: 0, bookings: 0 },
  { month: 'Nov', revenue: 0, bookings: 0 },
  { month: 'Dec', revenue: 0, bookings: 0 },
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

  // Dynamic Y-Axis ceiling (minimum 800 so empty/low states still look balanced)
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 800);
  const yTicks = [
    maxRevenue,
    maxRevenue * 0.75,
    maxRevenue * 0.5,
    maxRevenue * 0.25,
    0,
  ];

  // SVG coordinate space (optimized panoramic aspect ratio for full width display)
  const svgWidth = 1000;
  const svgHeight = 230;
  const padX = 20;
  const padTop = 16;
  const padBottom = 20;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padTop - padBottom;

  const getPoints = (key: 'revenue' | 'bookings', maxVal: number) =>
    data.map((d, i) => ({
      x: padX + (i / (data.length - 1)) * chartW,
      y: padTop + chartH - (maxVal > 0 ? (d[key] / maxVal) * chartH : 0),
    }));

  const revPoints = getPoints('revenue', maxRevenue);
  const maxBookings = Math.max(...data.map((d) => d.bookings), 8);
  const bookPoints = getPoints('bookings', maxBookings);

  // Smooth monotone cubic bezier curve generator (prevents overshooting below 0)
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
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
  const revAreaPath = `${revLinePath} L ${revPoints[revPoints.length - 1].x},${
    padTop + chartH
  } L ${revPoints[0].x},${padTop + chartH} Z`;
  const bookLinePath = buildSmoothPath(bookPoints);

  return (
    <div className="w-full rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Top Header & Legend */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Revenue Trend
            </span>
          </div>

          <div className="mt-1.5 flex items-baseline gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              ₱{totalRevenue.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                growthPercentage > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : growthPercentage < 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {growthPercentage >= 0 ? '↑' : '↓'} {Math.abs(growthPercentage)}%
            </span>

            <span className="text-xs text-slate-400">
              • {totalBookings} {totalBookings === 1 ? 'booking' : 'bookings'}
            </span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex items-center gap-5 rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600 ring-4 ring-amber-600/15" />
            Revenue
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-800 ring-4 ring-slate-800/10" />
            Bookings
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex">
        {/* Left Y-Axis Labels */}
        <div
          className="flex flex-col justify-between pr-3 text-right text-xs font-medium text-slate-400 select-none"
          style={{ height: `${svgHeight}px`, paddingTop: `${padTop - 6}px`, paddingBottom: `${padBottom - 6}px` }}
        >
          {yTicks.map((val, idx) => (
            <span key={idx}>₱{Math.round(val).toLocaleString()}</span>
          ))}
        </div>

        {/* Plot Container */}
        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full overflow-visible"
            style={{ height: `${svgHeight}px` }}
          >
            <defs>
              <linearGradient id="revenueGoldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D97706" stopOpacity="0.32" />
                <stop offset="65%" stopColor="#D97706" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Dashed Grid Lines */}
            {yTicks.map((_, idx) => {
              const y = padTop + (idx / (yTicks.length - 1)) * chartH;
              return (
                <line
                  key={idx}
                  x1={padX}
                  y1={y}
                  x2={svgWidth - padX}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                  strokeDasharray={idx === yTicks.length - 1 ? undefined : '4 4'}
                />
              );
            })}

            {/* Bookings Secondary Dashed Line */}
            <path
              d={bookLinePath}
              fill="none"
              stroke="#1E293B"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.45"
            />

            {/* Revenue Area & Main Smooth Line */}
            <path d={revAreaPath} fill="url(#revenueGoldGrad)" />
            <path
              d={revLinePath}
              fill="none"
              stroke="#CA8A04"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Hover Guide Line */}
            {hoveredIndex !== null && (
              <line
                x1={revPoints[hoveredIndex].x}
                y1={padTop}
                x2={revPoints[hoveredIndex].x}
                y2={padTop + chartH}
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

            {/* Crisp Circular Data Points */}
            {revPoints.map((pt, i) => {
              const isHovered = hoveredIndex === i;
              const hasValue = data[i].revenue > 0;
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={hasValue ? 4 : 3}
                  fill={isHovered ? '#CA8A04' : '#FFFFFF'}
                  stroke="#CA8A04"
                  strokeWidth={isHovered ? 2.5 : 2}
                />
              );
            })}

            {/* Invisible Hover Columns for Easy Mouse Tracking */}
            {revPoints.map((pt, i) => {
              const colWidth = chartW / data.length;
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

          {/* Floating Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-slate-900/95 px-3.5 py-2.5 text-xs text-white shadow-xl backdrop-blur-sm transition-all duration-75"
              style={{
                left: `${(revPoints[hoveredIndex].x / svgWidth) * 100}%`,
                top: `${Math.max(revPoints[hoveredIndex].y - 14, 12)}px`,
              }}
            >
              <div className="mb-1.5 font-semibold text-slate-200">
                {data[hoveredIndex].month}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Revenue
                </span>
                <span className="font-semibold text-white">
                  ₱{data[hoveredIndex].revenue.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Bookings
                </span>
                <span className="font-semibold text-white">
                  {data[hoveredIndex].bookings}
                </span>
              </div>
            </div>
          )}

          {/* Bottom X-Axis Month Labels */}
          <div className="mt-2 flex justify-between px-3 text-xs">
            {data.map((item, idx) => (
              <span
                key={item.month}
                className={`transition-colors font-medium ${
                  hoveredIndex === idx
                    ? 'text-amber-600'
                    : 'text-slate-400'
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

