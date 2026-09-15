import { useEffect, useMemo, useState } from 'react';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { TimeFilterKey, Transaction } from './types';
import {
  calculateCategoryBreakdown,
  calculateDailyCashflow,
  calculateSummary,
  filterTransactionsByTime,
} from './utils/filterUtils';
import { generateFinancialInsights } from './utils/insights';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TimeFilterBar } from './components/TimeFilterBar';
import { ChartsSection } from './components/ChartsSection';
import { RecentTransactionsTable } from './components/RecentTransactionsTable';
import { FinancialInsights } from './components/FinancialInsights';
import { TransactionModal } from './components/TransactionModal';
import { CheckCircle2, Info } from 'lucide-react';

const STORAGE_KEY = 'notion_personal_finance_txs_v1';

export default function App() {
  // 1. Transactions State initialized from localStorage or seed
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  // 2. Time Filter State (Default: 'this_month')
  const [timeFilter, setTimeFilter] = useState<TimeFilterKey>('this_month');

  // 3. Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // 4. Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 3200);
  };

  // Sync with localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // storage quota or disabled
    }
  }, [transactions]);

  // Reference date: September 15, 2026
  const refDate = useMemo(() => new Date(2026, 8, 15), []);

  // Filtered transactions for the current time frame
  const { filtered: filteredTransactions, rangeLabel } = useMemo(() => {
    return filterTransactionsByTime(transactions, timeFilter, refDate);
  }, [transactions, timeFilter, refDate]);

  // Calculations for Stat Cards
  const summaryStats = useMemo(() => {
    return calculateSummary(filteredTransactions);
  }, [filteredTransactions]);

  // Category breakdown for Bar Chart & Donut Chart
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(filteredTransactions);
  }, [filteredTransactions]);

  // Daily cashflow points for Line Chart
  const cashflowPoints = useMemo(() => {
    return calculateDailyCashflow(filteredTransactions);
  }, [filteredTransactions]);

  // Financial Insights (analyzes this month, previous month, and overall history)
  const insightsData = useMemo(() => {
    return generateFinancialInsights(transactions, refDate);
  }, [transactions, refDate]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, ...txData }
            : item
        )
      );
      showToast('Đã cập nhật giao dịch thành công!');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Đã thêm giao dịch: ${newTx.description} (${newTx.amount.toLocaleString('vi-VN')} ₫)`);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast(`Đã xóa giao dịch "${target.description}"`, 'info');
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại dữ liệu mẫu ban đầu?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      showToast('Đã khôi phục dữ liệu mẫu chuẩn thành công!');
    }
  };

  const handleExportCSV = () => {
    // Generate clean UTF-8 CSV with BOM
    const headers = [
      'Mã giao dịch',
      'Ngày',
      'Loại giao dịch',
      'Danh mục',
      'Nội dung',
      'Số tiền (VND)',
      'Phương thức thanh toán',
      'Ghi chú',
    ];

    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Giao_Dich_Tai_Chinh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file CSV thành công!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-lg text-xs sm:text-sm font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Notion Canvas Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* 1. Header with Notion Cover & Actions */}
        <Header
          onOpenAddModal={handleOpenAddModal}
          onExportCSV={handleExportCSV}
          onResetData={handleResetData}
          totalTransactionsCount={transactions.length}
        />

        {/* 2. Top Summary Stat Cards */}
        <StatCards stats={summaryStats} timeRangeLabel={rangeLabel} />

        {/* 3. Time Filter Selector */}
        <TimeFilterBar
          currentFilter={timeFilter}
          onChangeFilter={setTimeFilter}
          rangeLabel={rangeLabel}
          filteredCount={filteredTransactions.length}
        />

        {/* 4. Financial Charts Section (Bar, Donut, Line) */}
        <ChartsSection
          categoryData={categoryBreakdown}
          cashflowData={cashflowPoints}
          timeRangeLabel={rangeLabel}
        />

        {/* 5. Recent Transactions Database Table */}
        <RecentTransactionsTable
          transactions={transactions}
          onOpenAddModal={handleOpenAddModal}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />

        {/* 6. Financial Insights & Smart Alerts */}
        <FinancialInsights insights={insightsData} />

        {/* Footer note */}
        <footer className="border-t border-slate-200/80 pt-6 mt-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Personal Finance • Quản lý tài chính cá nhân thông minh & trực quan</span>
          <span>Dữ liệu lưu trữ an toàn & bảo mật cục bộ trên thiết bị</span>
        </footer>
      </main>

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
