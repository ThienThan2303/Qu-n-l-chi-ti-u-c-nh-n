import { useState } from 'react';
import { CategorySummary } from '../../types';
import { CATEGORY_EMOJIS, formatVND, formatVNDCompact } from '../../utils/formatters';

interface Props {
  data: CategorySummary[];
}

export function CategoryBarChart({ data }: Props) {
  const [hoveredCategory, setHoveredCategory] = useState<CategorySummary | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        id="empty-bar-chart"
        className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm"
      >
        <span className="text-2xl mb-1">📊</span>
        <span>Chưa có dữ liệu chi tiêu trong khoảng thời gian này</span>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  // Cap at top 8 categories for optimal mobile/desktop spacing, group remaining if any
  const displayData = data.slice(0, 8);

  return (
    <div id="category-bar-chart-container" className="relative w-full">
      {/* Tooltip display */}
      <div className="h-7 mb-2 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-600">
          {hoveredCategory
            ? `${CATEGORY_EMOJIS[hoveredCategory.category] || '🏷️'} ${hoveredCategory.category}: ${formatVND(hoveredCategory.amount)} (${hoveredCategory.percentage.toFixed(1)}% - ${hoveredCategory.count} giao dịch)`
            : '💡 Rê chuột / chạm vào thanh để xem chi tiết từng danh mục'}
        </span>
        <span className="text-slate-400 hidden sm:inline">Trục Y: Tổng tiền (₫)</span>
      </div>

      {/* Bar Chart Area */}
      <div className="space-y-2.5">
        {displayData.map((item) => {
          const barWidthPercent = Math.max(3, (item.amount / maxAmount) * 100);
          const isHovered = hoveredCategory?.category === item.category;

          return (
            <div
              key={item.category}
              id={`bar-row-${item.category}`}
              className="group cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredCategory(item)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => setHoveredCategory(item)}
            >
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span>{CATEGORY_EMOJIS[item.category] || '🏷️'}</span>
                  <span>{item.category}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
                <span className="text-slate-900 font-semibold">
                  {formatVND(item.amount)}
                </span>
              </div>

              {/* Bar track and fill */}
              <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1.5"
                  style={{
                    width: `${barWidthPercent}%`,
                    backgroundColor: item.color,
                    boxShadow: isHovered ? `0 0 10px ${item.color}66` : 'none',
                    filter: isHovered ? 'brightness(1.08)' : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 8 && (
        <div className="text-center text-[11px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
          + {data.length - 8} danh mục chi tiêu nhỏ khác
        </div>
      )}
    </div>
  );
}
