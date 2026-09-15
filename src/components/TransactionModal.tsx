import { useEffect, useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import {
  ALL_CATEGORIES,
  ALL_PAYMENT_METHODS,
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  formatVND,
  PAYMENT_METHOD_ICONS,
} from '../utils/formatters';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types';
import { getTodayDateString } from '../utils/filterUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}: Props) {
  const [date, setDate] = useState(getTodayDateString());
  const [type, setType] = useState<TransactionType>('Chi');
  const [category, setCategory] = useState<Category>('Ăn uống');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Ngân hàng');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize when editingTransaction changes or modal opens
  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.date);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setAmountStr(editingTransaction.amount.toString());
      setPaymentMethod(editingTransaction.paymentMethod);
      setNote(editingTransaction.note || '');
    } else {
      setDate(getTodayDateString());
      setType('Chi');
      setCategory('Ăn uống');
      setDescription('');
      setAmountStr('');
      setPaymentMethod('Ví điện tử');
      setNote('');
    }
    setErrorMsg('');
  }, [editingTransaction, isOpen]);

  // Adjust default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'Thu') {
      if (category !== 'Lương' && category !== 'Thưởng' && category !== 'Đầu tư' && category !== 'Khác') {
        setCategory('Lương');
      }
    } else {
      if (category === 'Lương' || category === 'Thưởng') {
        setCategory('Ăn uống');
      }
    }
  };

  const handleAddPreset = (val: number) => {
    const current = parseInt(amountStr || '0', 10) || 0;
    setAmountStr((current + val).toString());
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10);

    if (!description.trim()) {
      setErrorMsg('Vui lòng nhập nội dung giao dịch');
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ (> 0 ₫)');
      return;
    }

    onSave(
      {
        date,
        type,
        category,
        description: description.trim(),
        amount: parsedAmount,
        paymentMethod,
        note: note.trim() || undefined,
      },
      editingTransaction ? editingTransaction.id : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  const currentAmountNum = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  return (
    <div
      id="transaction-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="transaction-modal-box"
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">
              {editingTransaction ? '✏️' : '✨'}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type selector (Thu vs Chi) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Loại giao dịch
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="modal-type-chi"
                onClick={() => handleTypeChange('Chi')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  type === 'Chi'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🔴 Chi tiêu</span>
              </button>
              <button
                type="button"
                id="modal-type-thu"
                onClick={() => handleTypeChange('Thu')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  type === 'Thu'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🟢 Thu nhập</span>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Số tiền (₫)
              </label>
              {currentAmountNum > 0 && (
                <span className="text-xs font-bold text-indigo-600 font-mono">
                  {formatVND(currentAmountNum)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="modal-amount-input"
                type="text"
                inputMode="numeric"
                required
                value={amountStr ? Number(amountStr).toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setAmountStr(raw);
                }}
                placeholder="VD: 50.000"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                VND
              </span>
            </div>

            {/* Quick amount increment pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[50000, 100000, 200000, 500000, 1000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  +{preset >= 1000000 ? `${preset / 1000000}tr` : `${preset / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Nội dung mô tả
            </label>
            <input
              id="modal-desc-input"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Ăn trưa, Đổ xăng, Mua đồ siêu thị..."
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-colors"
            />
          </div>

          {/* Grid: Ngày & Danh mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Ngày giao dịch
              </label>
              <input
                id="modal-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 cursor-pointer"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Danh mục
              </label>
              <select
                id="modal-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_EMOJIS[cat]} {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Phương thức thanh toán
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 px-2 rounded-xl border text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{PAYMENT_METHOD_ICONS[method]}</span>
                    <span>{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Ghi chú (Tùy chọn)
            </label>
            <input
              id="modal-note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đi cùng ai, chi phí định kỳ, hóa đơn kèm theo..."
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              id="modal-submit-btn"
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{editingTransaction ? 'Lưu thay đổi' : 'Thêm giao dịch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
