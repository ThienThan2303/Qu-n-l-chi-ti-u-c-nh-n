import {
  Category,
  CategorySummary,
  DailyCashflowPoint,
  SummaryStats,
  TimeFilterKey,
  Transaction,
} from '../types';
import { CATEGORY_COLORS } from './formatters';

export function getTodayDateString(refDate: Date = new Date()): string {
  const y = refDate.getFullYear();
  const m = String(refDate.getMonth() + 1).padStart(2, '0');
  const d = String(refDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function filterTransactionsByTime(
  transactions: Transaction[],
  filterKey: TimeFilterKey,
  refDate: Date = new Date()
): { filtered: Transaction[]; rangeLabel: string } {
  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth(); // 0-indexed
  const todayStr = getTodayDateString(refDate);

  // Helper date parsing (YYYY-MM-DD)
  const parseTxDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  switch (filterKey) {
    case 'today': {
      const filtered = transactions.filter((t) => t.date === todayStr);
      return { filtered, rangeLabel: `Hôm nay (${todayStr})` };
    }
    case 'this_week': {
      // Calculate Monday of current week
      const dayOfWeek = refDate.getDay(); // 0 is Sunday, 1 is Monday...
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(refDate);
      monday.setDate(refDate.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const filtered = transactions.filter((t) => {
        const d = parseTxDate(t.date);
        return d >= monday && d <= sunday;
      });
      return {
        filtered,
        rangeLabel: `Tuần này (${getTodayDateString(monday)} → ${getTodayDateString(sunday)})`,
      };
    }
    case 'this_month': {
      const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const filtered = transactions.filter((t) => t.date.startsWith(monthPrefix));
      return {
        filtered,
        rangeLabel: `Tháng ${currentMonth + 1}/${currentYear}`,
      };
    }
    case 'last_month': {
      const prevDate = new Date(currentYear, currentMonth - 1, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth() + 1;
      const monthPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      const filtered = transactions.filter((t) => t.date.startsWith(monthPrefix));
      return {
        filtered,
        rangeLabel: `Tháng ${prevMonth}/${prevYear}`,
      };
    }
    case 'this_quarter': {
      const quarterIndex = Math.floor(currentMonth / 3); // 0, 1, 2, 3
      const startMonth = quarterIndex * 3;
      const endMonth = startMonth + 2;
      const startQuarter = new Date(currentYear, startMonth, 1);
      const endQuarter = new Date(currentYear, endMonth + 1, 0, 23, 59, 59, 999);

      const filtered = transactions.filter((t) => {
        const d = parseTxDate(t.date);
        return d >= startQuarter && d <= endQuarter;
      });
      return {
        filtered,
        rangeLabel: `Quý ${quarterIndex + 1}/${currentYear} (Tháng ${startMonth + 1} - ${endMonth + 1})`,
      };
    }
    case 'this_year': {
      const yearPrefix = `${currentYear}-`;
      const filtered = transactions.filter((t) => t.date.startsWith(yearPrefix));
      return {
        filtered,
        rangeLabel: `Năm ${currentYear}`,
      };
    }
    case 'all':
    default:
      return {
        filtered: [...transactions],
        rangeLabel: 'Toàn bộ thời gian',
      };
  }
}

export function calculateSummary(transactions: Transaction[]): SummaryStats {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'Thu') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  }

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpense,
    balance,
    savingsRate,
  };
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategorySummary[] {
  // Focus on Expenses
  const expenses = transactions.filter((t) => t.type === 'Chi');
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const map = new Map<Category, { amount: number; count: number }>();

  for (const t of expenses) {
    const existing = map.get(t.category) || { amount: 0, count: 0 };
    existing.amount += t.amount;
    existing.count += 1;
    map.set(t.category, existing);
  }

  const list: CategorySummary[] = [];
  map.forEach((value, category) => {
    list.push({
      category,
      amount: value.amount,
      count: value.count,
      percentage: totalExpense > 0 ? (value.amount / totalExpense) * 100 : 0,
      color: CATEGORY_COLORS[category] || '#94A3B8',
    });
  });

  // Sort descending by amount
  return list.sort((a, b) => b.amount - a.amount);
}

export function calculateDailyCashflow(transactions: Transaction[]): DailyCashflowPoint[] {
  const map = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const existing = map.get(t.date) || { income: 0, expense: 0 };
    if (t.type === 'Thu') {
      existing.income += t.amount;
    } else {
      existing.expense += t.amount;
    }
    map.set(t.date, existing);
  }

  const dates = Array.from(map.keys()).sort();

  return dates.map((date) => {
    const data = map.get(date)!;
    const parts = date.split('-');
    const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
    return {
      date,
      displayDate,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    };
  });
}
