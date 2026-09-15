export type TransactionType = 'Thu' | 'Chi';

export type Category =
  | 'Ăn uống'
  | 'Di chuyển'
  | 'Mua sắm'
  | 'Giải trí'
  | 'Hóa đơn'
  | 'Nhà ở'
  | 'Sức khỏe'
  | 'Giáo dục'
  | 'Lương'
  | 'Thưởng'
  | 'Đầu tư'
  | 'Khác';

export type PaymentMethod = 'Tiền mặt' | 'Ngân hàng' | 'Ví điện tử' | 'Thẻ';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: Category;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: number;
}

export type TimeFilterKey =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'all';

export interface TimeFilterOption {
  key: TimeFilterKey;
  label: string;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

export interface CategorySummary {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface DailyCashflowPoint {
  date: string;
  displayDate: string;
  income: number;
  expense: number;
  net: number;
}
