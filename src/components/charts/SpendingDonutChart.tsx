import { useState } from 'react';
import { CategorySummary } from '../../types';
import { CATEGORY_EMOJIS, formatVND, formatVNDCompact } from '../../utils/formatters';

interface Props {
  data: CategorySummary[];
}

export function SpendingDonutChart({ data }: Props) {
  const [hoveredCategory, setHoveredCategory] = useState<CategorySummary | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        id="empty-donut-chart"
        className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm"
      >
        <span className="text-2xl mb-1">🍩</span>
        <span>Chưa có dữ liệu tỷ trọng chi tiêu</span>
      </div>
    );
  }

  const totalExpense = data.reduce((acc, curr) => acc + curr.amount, 0);

  // SVG Geometry: radius, center, circumference
  const size = 220;
  const strokeWidth = 36;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke-dasharray & stroke-dashoffset for each slice
  let accumulatedPercent = 0;
  const slices = data.map((item) => {
    const fraction = totalExpense > 0 ? item.amount / totalExpense : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredCategory || (data.length > 0 ? data[0] : null);

  return (
    <div id="spending-donut-chart-container" className="flex flex-col items-center w-full">
      {/* Donut graphic */}
      <div className="relative w-[220px] h-[220px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full -rotate-90 transform"
        >
          {/* Base track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHovered = hoveredCategory?.category === slice.category;
            return (
              <circle
                key={slice.category}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  filter: isHovered ? 'drop-shadow(0 0 6px rgba(0,0,0,0.15))' : 'none',
                }}
                onMouseEnter={() => setHoveredCategory(slice)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => setHoveredCategory(slice)}
              />
            );
          })}
        </svg>

        {/* Center info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
            {activeItem ? `${CATEGORY_EMOJIS[activeItem.category]} ${activeItem.category}` : 'Tổng chi'}
          </span>
          <span className="text-base font-bold text-slate-800 tracking-tight leading-tight">
            {activeItem ? formatVNDCompact(activeItem.amount) : formatVNDCompact(totalExpense)}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold mt-0.5">
            {activeItem ? `${activeItem.percentage.toFixed(1)}%` : '100%'}
          </span>
        </div>
      </div>

      {/* Interactive Legend List */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full mt-4 max-h-40 overflow-y-auto pr-1">
        {data.map((item) => {
          const isSelected = hoveredCategory?.category === item.category;
          return (
            <button
              key={item.category}
              id={`donut-legend-${item.category}`}
              type="button"
              className={`flex items-center justify-between text-left p-1.5 rounded-lg border text-xs transition-colors ${
                isSelected
                  ? 'bg-slate-100 border-slate-300 shadow-xs'
                  : 'border-transparent hover:bg-slate-50'
              }`}
              onMouseEnter={() => setHoveredCategory(item)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => setHoveredCategory(item)}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-slate-700 font-medium">
                  {CATEGORY_EMOJIS[item.category]} {item.category}
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[11px] ml-1 shrink-0">
                {item.percentage.toFixed(0)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
