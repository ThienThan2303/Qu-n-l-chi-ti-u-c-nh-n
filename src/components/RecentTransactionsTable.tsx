import { useMemo, useState } from 'react';
import {
  Edit2,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS } from '../utils/formatters';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  formatDateVN,
  formatVND,
  getTypeBadge,
  PAYMENT_METHOD_ICONS,
} from '../utils/formatters';

interface Props {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export function RecentTransactionsTable({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType | 'Đầu tư'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  // Filter & sort newest first
  const processedTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        // Sort newest date first, then newest creation
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      })
      .filter((t) => {
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchNote = (t.note || '').toLowerCase().includes(q);
          const matchMethod = t.paymentMethod.toLowerCase().includes(q);
          if (!matchDesc && !matchCat && !matchNote && !matchMethod) {
            return false;
          }
        }

        // Type filter
        if (typeFilter === 'Đầu tư') {
          if (t.category !== 'Đầu tư') return false;
        } else if (typeFilter !== 'all') {
          if (t.type !== typeFilter) return false;
        }

        // Category filter
        if (categoryFilter !== 'all') {
          if (t.category !== categoryFilter) return false;
        }

        return true;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  const displayedList = processedTransactions.slice(0, visibleCount);

  return (
    <section id="recent-transactions-section" className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl select-none">💳</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Database Giao dịch</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {processedTransactions.length} bản ghi
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Sắp xếp giao dịch mới nhất lên đầu • Phân biệt màu sắc: 🟢 Thu nhập | 🔴 Chi tiêu | 🔵 Đầu tư
            </p>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          id="btn-add-tx-table-header"
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Thêm giao dịch</span>
        </button>
      </div>

      {/* Notion Filter & Search Toolbar */}
      <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200/80 p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-transactions-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo nội dung, danh mục, ghi chú..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Filter Type */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('Thu')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                typeFilter === 'Thu'
                  ? 'bg-emerald-50 text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              🟢 Thu
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('Chi')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                typeFilter === 'Chi'
                  ? 'bg-rose-50 text-rose-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              🔴 Chi
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('Đầu tư')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                typeFilter === 'Đầu tư'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              🔵 Đầu tư
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <select
            id="category-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">📁 Tất cả danh mục</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_EMOJIS[cat]} {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notion Table Container */}
      <div className="bg-white rounded-b-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
        <table id="transactions-data-table" className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-28">Ngày</th>
              <th className="py-3 px-4 w-28">Loại</th>
              <th className="py-3 px-4 w-36">Danh mục</th>
              <th className="py-3 px-4 min-w-[200px]">Nội dung</th>
              <th className="py-3 px-4 w-36">Phương thức</th>
              <th className="py-3 px-4 w-36 text-right">Số tiền</th>
              <th className="py-3 px-3 w-20 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {displayedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-3xl">🔍</span>
                    <span className="text-sm font-medium text-slate-600">
                      Không tìm thấy giao dịch phù hợp
                    </span>
                    <span className="text-xs text-slate-400">
                      Thử thay đổi bộ lọc hoặc thêm giao dịch mới
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              displayedList.map((tx) => {
                const badge = getTypeBadge(tx.type, tx.category);
                const isInvest = tx.category === 'Đầu tư';
                const isIncome = tx.type === 'Thu';

                return (
                  <tr
                    key={tx.id}
                    id={`tx-row-${tx.id}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Ngày */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {formatDateVN(tx.date)}
                    </td>

                    {/* Loại */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badge.bgClass}`}
                      >
                        <span className="text-[10px]">{badge.symbol}</span>
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Danh mục */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[tx.category]}12`,
                          borderColor: `${CATEGORY_COLORS[tx.category]}30`,
                          color: CATEGORY_COLORS[tx.category],
                        }}
                      >
                        <span>{CATEGORY_EMOJIS[tx.category] || '🏷️'}</span>
                        <span>{tx.category}</span>
                      </span>
                    </td>

                    {/* Nội dung & Ghi chú */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">
                        {tx.description}
                      </div>
                      {tx.note && (
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                          📝 {tx.note}
                        </div>
                      )}
                    </td>

                    {/* Phương thức thanh toán */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        <span>{PAYMENT_METHOD_ICONS[tx.paymentMethod] || '💳'}</span>
                        <span>{tx.paymentMethod}</span>
                      </span>
                    </td>

                    {/* Số tiền */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isInvest
                            ? 'text-blue-600'
                            : isIncome
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatVND(tx.amount)}
                      </span>
                    </td>

                    {/* Hành động (Sửa / Xóa) */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          id={`btn-edit-${tx.id}`}
                          onClick={() => onEditTransaction(tx)}
                          title="Chỉnh sửa giao dịch"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-${tx.id}`}
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Xóa giao dịch"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer & Pagination */}
        <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Hiển thị {Math.min(visibleCount, processedTransactions.length)} /{' '}
              {processedTransactions.length} giao dịch
            </span>
          </div>

          {visibleCount < processedTransactions.length && (
            <button
              id="btn-load-more"
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 15)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer hover:underline"
            >
              + Xem thêm {processedTransactions.length - visibleCount} giao dịch khác
            </button>
          )}

          <div className="text-[11px] text-slate-400 font-mono">
            Tự động đồng bộ với Dashboard
          </div>
        </div>
      </div>
    </section>
  );
}
