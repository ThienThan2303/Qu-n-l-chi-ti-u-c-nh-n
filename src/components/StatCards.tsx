import { ArrowDownRight, ArrowUpRight, Percent, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { SummaryStats } from '../types';
import { formatVND } from '../utils/formatters';

interface Props {
  stats: SummaryStats;
  timeRangeLabel: string;
}

export function StatCards({ stats, timeRangeLabel }: Props) {
  const isPositiveBalance = stats.balance >= 0;
  const formattedSavingsRate = isNaN(stats.savingsRate) ? '0%' : `${stats.savingsRate.toFixed(1)}%`;

  return (
    <div
      id="stat-cards-container"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {/* 1. 💰 Tổng thu */}
      <div
        id="stat-card-income"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">💰</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng thu
            </span>
          </div>
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
          {formatVND(stats.totalIncome)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Dòng tiền thu vào ({timeRangeLabel})</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 opacity-80" />
      </div>

      {/* 2. 💸 Tổng chi */}
      <div
        id="stat-card-expense"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">💸</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng chi
            </span>
          </div>
          <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <ArrowDownRight className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
          {formatVND(stats.totalExpense)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Tổng tiền đã chi ({timeRangeLabel})</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 opacity-80" />
      </div>

      {/* 3. 📈 Số dư */}
      <div
        id="stat-card-balance"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">📈</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Số dư
            </span>
          </div>
          <span
            className={`p-2 rounded-xl ${
              isPositiveBalance
                ? 'bg-blue-50 text-blue-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isPositiveBalance ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </span>
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold tracking-tight mb-1 ${
            isPositiveBalance ? 'text-blue-600' : 'text-amber-600'
          }`}
        >
          {formatVND(stats.balance)}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
            = Thu – Chi
          </span>
          <span className="truncate">
            {isPositiveBalance ? 'Thặng dư tích lũy' : 'Chi vượt thu'}
          </span>
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            isPositiveBalance ? 'bg-blue-500' : 'bg-amber-500'
          } opacity-80`}
        />
      </div>

      {/* 4. 🎯 Tỷ lệ tiết kiệm */}
      <div
        id="stat-card-savings-rate"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">🎯</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tỷ lệ tiết kiệm
            </span>
          </div>
          <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <PiggyBank className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
          {formattedSavingsRate}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
            Số dư / Thu × 100%
          </span>
          <span
            className={`font-semibold ${
              stats.savingsRate >= 20
                ? 'text-emerald-600'
                : stats.savingsRate > 0
                ? 'text-purple-600'
                : 'text-rose-600'
            }`}
          >
            {stats.savingsRate >= 20 ? 'Rất tốt' : stats.savingsRate > 0 ? 'Ổn' : 'Cần tối ưu'}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 opacity-80" />
      </div>
    </div>
  );
}
