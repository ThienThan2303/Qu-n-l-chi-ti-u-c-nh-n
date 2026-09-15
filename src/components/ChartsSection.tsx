import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { CategorySummary, DailyCashflowPoint } from '../types';
import { CategoryBarChart } from './charts/CategoryBarChart';
import { CashflowLineChart } from './charts/CashflowLineChart';
import { SpendingDonutChart } from './charts/SpendingDonutChart';

interface Props {
  categoryData: CategorySummary[];
  cashflowData: DailyCashflowPoint[];
  timeRangeLabel: string;
}

export function ChartsSection({ categoryData, cashflowData, timeRangeLabel }: Props) {
  return (
    <section id="financial-charts-section" className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl select-none">📊</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Phân tích tài chính
            </h2>
            <p className="text-xs text-slate-500">
              Trực quan hóa danh mục chi tiêu, tỷ trọng cơ cấu và diễn biến dòng tiền ({timeRangeLabel})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Bar Chart – Chi tiêu theo danh mục */}
        <div
          id="chart-card-bar"
          className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Chi tiêu theo danh mục
                </h3>
                <p className="text-[11px] text-slate-500">
                  Xếp hạng danh mục tiêu nhiều nhất trong kỳ
                </p>
              </div>
            </div>
          </div>
          <div className="pt-1">
            <CategoryBarChart data={categoryData} />
          </div>
        </div>

        {/* 2. Donut Chart – Tỷ trọng chi tiêu */}
        <div
          id="chart-card-donut"
          className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Tỷ trọng chi tiêu
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cơ cấu phần trăm (%) theo từng nhóm chi
                </p>
              </div>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-center">
            <SpendingDonutChart data={categoryData} />
          </div>
        </div>

        {/* 3. Line Chart – Dòng tiền theo thời gian */}
        <div
          id="chart-card-line"
          className="lg:col-span-12 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Dòng tiền theo thời gian
                </h3>
                <p className="text-[11px] text-slate-500">
                  So sánh xu hướng Tổng thu (xanh lá) và Tổng chi (đỏ/cam) theo các mốc ngày
                </p>
              </div>
            </div>
          </div>
          <CashflowLineChart data={cashflowData} />
        </div>
      </div>
    </section>
  );
}
