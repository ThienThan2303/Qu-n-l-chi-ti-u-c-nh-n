import { useMemo, useState } from 'react';
import { DailyCashflowPoint } from '../../types';
import { formatVND, formatVNDCompact } from '../../utils/formatters';

interface Props {
  data: DailyCashflowPoint[];
}

export function CashflowLineChart({ data }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div
        id="empty-line-chart"
        className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm"
      >
        <span className="text-2xl mb-1">📈</span>
        <span>Chưa có dữ liệu dòng tiền trong khoảng thời gian này</span>
      </div>
    );
  }

  // SVG viewport dimensions
  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 24, bottom: 35, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value for Y-axis
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expense)),
    1000000 // minimum baseline 1M VND
  );

  const getX = (index: number) => {
    if (chartData.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (chartData.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return padding.top + chartHeight - (value / maxVal) * chartHeight;
  };

  // Build SVG path strings
  const incomePoints = chartData.map((d, i) => `${getX(i)},${getY(d.income)}`);
  const expensePoints = chartData.map((d, i) => `${getX(i)},${getY(d.expense)}`);

  const incomePath = `M ${incomePoints.join(' L ')}`;
  const expensePath = `M ${expensePoints.join(' L ')}`;

  const incomeArea = chartData.length > 1
    ? `${incomePath} L ${getX(chartData.length - 1)},${padding.top + chartHeight} L ${getX(0)},${padding.top + chartHeight} Z`
    : '';
  const expenseArea = chartData.length > 1
    ? `${expensePath} L ${getX(chartData.length - 1)},${padding.top + chartHeight} L ${getX(0)},${padding.top + chartHeight} Z`
    : '';

  const hoveredItem = hoverIndex !== null && chartData[hoverIndex] ? chartData[hoverIndex] : null;

  // Generate 4 Y-axis guide ticks
  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  // Pick suitable X-axis labels (up to 6 ticks)
  const step = Math.max(1, Math.floor(chartData.length / 5));
  const xTickIndices = chartData
    .map((_, i) => i)
    .filter((i) => i === 0 || i === chartData.length - 1 || i % step === 0);

  return (
    <div id="cashflow-line-chart-container" className="w-full flex flex-col">
      {/* Legend & Tooltip Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span>
            <span className="text-slate-700 font-medium">Thu nhập (Tổng thu)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-rose-500 rounded-full inline-block"></span>
            <span className="text-slate-700 font-medium">Chi tiêu (Tổng chi)</span>
          </div>
        </div>

        <div className="text-slate-500 text-[11px] font-medium min-h-[20px]">
          {hoveredItem ? (
            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              📅 {hoveredItem.displayDate} ({hoveredItem.date}): Thu{' '}
              <strong className="text-emerald-600">{formatVND(hoveredItem.income)}</strong> | Chi{' '}
              <strong className="text-rose-600">{formatVND(hoveredItem.expense)}</strong>
            </span>
          ) : (
            <span>💡 Rê chuột lên điểm ngày để xem dòng tiền</span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-xl border border-slate-100 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray={idx === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  className="font-mono"
                >
                  {formatVNDCompact(val)}
                </text>
              </g>
            );
          })}

          {/* Fill Areas */}
          {incomeArea && <path d={incomeArea} fill="url(#incomeGradient)" />}
          {expenseArea && <path d={expenseArea} fill="url(#expenseGradient)" />}

          {/* Income Line */}
          <path
            d={incomePath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Expense Line */}
          <path
            d={expensePath}
            fill="none"
            stroke="#F43F5E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive trigger columns */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const yIncome = getY(d.income);
            const yExpense = getY(d.expense);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* Active vertical hover guideline */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Income point */}
                {d.income > 0 && (
                  <circle
                    cx={x}
                    cy={yIncome}
                    r={isHovered ? 5 : 3.5}
                    fill="#FFFFFF"
                    stroke="#10B981"
                    strokeWidth="2.5"
                  />
                )}

                {/* Expense point */}
                {d.expense > 0 && (
                  <circle
                    cx={x}
                    cy={yExpense}
                    r={isHovered ? 5 : 3.5}
                    fill="#FFFFFF"
                    stroke="#F43F5E"
                    strokeWidth="2.5"
                  />
                )}

                {/* Wide transparent hover zone for comfortable clicking/touching */}
                <rect
                  x={x - (chartWidth / Math.max(1, chartData.length)) / 2}
                  y={padding.top}
                  width={chartWidth / Math.max(1, chartData.length)}
                  height={chartHeight + padding.bottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => setHoverIndex(i)}
                />
              </g>
            );
          })}

          {/* X-axis date labels */}
          {xTickIndices.map((idx) => {
            const x = getX(idx);
            const item = chartData[idx];
            return (
              <text
                key={idx}
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#64748B"
                fontWeight="500"
              >
                {item.displayDate}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
