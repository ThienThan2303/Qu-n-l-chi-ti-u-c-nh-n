import { Calendar, Filter } from 'lucide-react';
import { TimeFilterKey, TimeFilterOption } from '../types';

interface Props {
  currentFilter: TimeFilterKey;
  onChangeFilter: (key: TimeFilterKey) => void;
  rangeLabel: string;
  filteredCount: number;
}

const FILTER_OPTIONS: TimeFilterOption[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'this_week', label: 'Tuần này' },
  { key: 'this_month', label: 'Tháng này' },
  { key: 'last_month', label: 'Tháng trước' },
  { key: 'this_quarter', label: 'Quý này' },
  { key: 'this_year', label: 'Năm nay' },
  { key: 'all', label: 'Tất cả' },
];

export function TimeFilterBar({
  currentFilter,
  onChangeFilter,
  rangeLabel,
  filteredCount,
}: Props) {
  return (
    <div
      id="time-filter-bar"
      className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-400">Thời gian:</span>
        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
          {rangeLabel}
        </span>
        <span className="text-slate-400">• {filteredCount} bản ghi</span>
      </div>

      {/* Pill buttons */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = currentFilter === opt.key;
          return (
            <button
              key={opt.key}
              id={`filter-btn-${opt.key}`}
              type="button"
              onClick={() => onChangeFilter(opt.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {opt.label}
              {opt.key === 'this_month' && (
                <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                  (Mặc định)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
