import { Category, PaymentMethod, TransactionType } from '../types';

export const CATEGORY_COLORS: Record<Category, string> = {
  'Ăn uống': '#F97316', // Orange
  'Di chuyển': '#0EA5E9', // Sky
  'Mua sắm': '#EC4899', // Pink
  'Giải trí': '#8B5CF6', // Purple
  'Hóa đơn': '#64748B', // Slate
  'Nhà ở': '#6366F1', // Indigo
  'Sức khỏe': '#14B8A6', // Teal
  'Giáo dục': '#EAB308', // Yellow
  'Lương': '#10B981', // Emerald
  'Thưởng': '#059669', // Dark emerald
  'Đầu tư': '#2563EB', // Blue
  'Khác': '#94A3B8', // Gray
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  'Ăn uống': '🍲',
  'Di chuyển': '🛵',
  'Mua sắm': '🛍️',
  'Giải trí': '🎮',
  'Hóa đơn': '🧾',
  'Nhà ở': '🏠',
  'Sức khỏe': '💊',
  'Giáo dục': '📚',
  'Lương': '💵',
  'Thưởng': '🎁',
  'Đầu tư': '📈',
  'Khác': '📦',
};

export const ALL_CATEGORIES: Category[] = [
  'Ăn uống',
  'Di chuyển',
  'Mua sắm',
  'Giải trí',
  'Hóa đơn',
  'Nhà ở',
  'Sức khỏe',
  'Giáo dục',
  'Lương',
  'Thưởng',
  'Đầu tư',
  'Khác',
];

export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  'Tiền mặt',
  'Ngân hàng',
  'Ví điện tử',
  'Thẻ',
];

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  'Tiền mặt': '💵',
  'Ngân hàng': '🏦',
  'Ví điện tử': '📱',
  'Thẻ': '💳',
};

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 ₫';
  }
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  return `${formatted} ₫`;
}

export function formatVNDCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ ₫`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} tr ₫`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k ₫`;
  }
  return formatVND(amount);
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getTypeBadge(type: TransactionType, category?: Category) {
  if (category === 'Đầu tư') {
    return {
      label: 'Đầu tư',
      bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
      symbol: '🔵',
    };
  }
  if (type === 'Thu') {
    return {
      label: 'Thu nhập',
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      symbol: '🟢',
    };
  }
  return {
    label: 'Chi tiêu',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
    symbol: '🔴',
  };
}
