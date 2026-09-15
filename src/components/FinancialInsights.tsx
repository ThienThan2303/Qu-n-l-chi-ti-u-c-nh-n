import { AlertTriangle, CheckCircle2, Info, Lightbulb, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { FinancialInsightsData } from '../utils/insights';

interface Props {
  insights: FinancialInsightsData;
}

export function FinancialInsights({ insights }: Props) {
  return (
    <section id="financial-insights-section" className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl select-none">💡</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Financial Insights
            </h2>
            <p className="text-xs text-slate-500">
              Phân tích tự động, so sánh tháng trước và cảnh báo thông minh dựa trên dữ liệu thu chi
            </p>
          </div>
        </div>
      </div>

      {/* Notion Callout Alerts (Cảnh báo & Gợi ý) */}
      {insights.alerts.length > 0 && (
        <div className="space-y-3 mb-6">
          {insights.alerts.map((alert) => {
            const isWarning = alert.type === 'warning';
            const isPositive = alert.type === 'positive';

            return (
              <div
                key={alert.id}
                id={`alert-box-${alert.id}`}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isWarning
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                    : isPositive
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                    : 'bg-blue-50/70 border-blue-200/80 text-blue-900'
                }`}
              >
                <div className="text-xl select-none shrink-0 mt-0.5">
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-bold tracking-tight">
                    {alert.message}
                  </div>
                  {alert.detail && (
                    <div
                      className={`text-xs mt-1 leading-relaxed ${
                        isWarning
                          ? 'text-amber-700'
                          : isPositive
                          ? 'text-emerald-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {alert.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6 Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.metrics.map((metric) => (
          <div
            key={metric.id}
            id={`insight-metric-${metric.id}`}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg select-none">{metric.icon}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {metric.title}
              </span>
            </div>

            <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1">
              {metric.value}
            </div>

            {metric.subtitle && (
              <div
                className={`text-xs leading-normal font-medium ${
                  metric.type === 'warning'
                    ? 'text-rose-600'
                    : metric.type === 'success'
                    ? 'text-emerald-600'
                    : 'text-slate-500'
                }`}
              >
                {metric.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cashflow Summary Callout Box */}
      <div className="mt-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5 border border-indigo-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Đánh giá sức khỏe tài chính tháng này</span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  insights.savingsRate >= 20
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : insights.savingsRate > 0
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {insights.savingsRate >= 20
                  ? 'Tuyệt vời'
                  : insights.savingsRate > 0
                  ? 'Cần theo dõi'
                  : 'Cảnh báo'}{' '}
                ({insights.savingsRate}% tích lũy)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {insights.cashflowTrend.description}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right sm:border-l sm:border-slate-100 sm:pl-6 shrink-0">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Thặng dư tháng này
          </div>
          <div
            className={`text-lg sm:text-xl font-bold font-mono ${
              insights.cashflowTrend.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {insights.cashflowTrend.netBalance >= 0 ? '+' : ''}
            {insights.cashflowTrend.netBalance.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>
    </section>
  );
}
