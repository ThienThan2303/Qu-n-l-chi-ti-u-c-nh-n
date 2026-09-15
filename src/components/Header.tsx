import { ArrowDownToLine, Plus, RotateCcw } from 'lucide-react';

interface Props {
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  totalTransactionsCount: number;
}

export function Header({
  onOpenAddModal,
  onExportCSV,
  onResetData,
  totalTransactionsCount,
}: Props) {
  return (
    <header id="dashboard-header" className="relative w-full mb-6 pt-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        {/* Title and Icon */}
        <div className="flex items-center gap-3.5">
          <div
            id="page-icon-badge"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-2xs border border-slate-200 flex items-center justify-center text-2xl sm:text-3xl select-none shrink-0"
          >
            💰
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                id="main-app-title"
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
              >
                PERSONAL FINANCE
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {totalTransactionsCount} giao dịch
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Theo dõi dòng tiền – Kiểm soát chi tiêu – Xây dựng tài chính tốt hơn
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
          <button
            id="btn-add-transaction"
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Thêm giao dịch</span>
          </button>

          <button
            id="btn-export-csv"
            type="button"
            onClick={onExportCSV}
            title="Xuất dữ liệu ra file CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4 text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          <button
            id="btn-reset-sample"
            type="button"
            onClick={onResetData}
            title="Đặt lại dữ liệu mẫu ban đầu"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mẫu chuẩn</span>
          </button>
        </div>
      </div>
    </header>
  );
}
