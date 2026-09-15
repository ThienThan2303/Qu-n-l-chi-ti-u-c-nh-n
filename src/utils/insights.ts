import { Category, Transaction } from '../types';
import { calculateCategoryBreakdown, filterTransactionsByTime } from './filterUtils';
import { formatDateVN, formatVND } from './formatters';

export interface InsightMetric {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  type: 'neutral' | 'success' | 'warning' | 'info';
}

export interface InsightAlert {
  id: string;
  type: 'warning' | 'tip' | 'positive';
  icon: string;
  message: string;
  detail?: string;
}

export interface FinancialInsightsData {
  topCategory: { category: Category | 'Không có'; amount: number; percentage: number } | null;
  totalExpenseThisMonth: number;
  expenseComparisonWithLastMonth: {
    diffAmount: number;
    diffPercent: number;
    direction: 'up' | 'down' | 'equal';
    lastMonthExpense: number;
  };
  highestExpenseDay: { date: string; amount: number; count: number } | null;
  monthlyAverageIncome: number;
  dailyAverageExpense: number;
  savingsRate: number;
  cashflowTrend: {
    status: 'dương' | 'âm' | 'cân bằng';
    description: string;
    netBalance: number;
  };
  metrics: InsightMetric[];
  alerts: InsightAlert[];
}

export function generateFinancialInsights(
  allTransactions: Transaction[],
  refDate: Date = new Date()
): FinancialInsightsData {
  // 1. Transactions for this month & last month
  const { filtered: thisMonthTxs } = filterTransactionsByTime(allTransactions, 'this_month', refDate);
  const { filtered: lastMonthTxs } = filterTransactionsByTime(allTransactions, 'last_month', refDate);

  // This month breakdown
  const thisMonthExpenses = thisMonthTxs.filter((t) => t.type === 'Chi');
  const thisMonthIncomes = thisMonthTxs.filter((t) => t.type === 'Thu');
  const totalExpenseThisMonth = thisMonthExpenses.reduce((acc, c) => acc + c.amount, 0);
  const totalIncomeThisMonth = thisMonthIncomes.reduce((acc, c) => acc + c.amount, 0);

  // Last month breakdown
  const lastMonthExpenses = lastMonthTxs.filter((t) => t.type === 'Chi');
  const totalExpenseLastMonth = lastMonthExpenses.reduce((acc, c) => acc + c.amount, 0);

  // Category breakdown this month
  const categoryBreakdown = calculateCategoryBreakdown(thisMonthTxs);
  const topCategory = categoryBreakdown.length > 0
    ? {
        category: categoryBreakdown[0].category,
        amount: categoryBreakdown[0].amount,
        percentage: categoryBreakdown[0].percentage,
      }
    : null;

  // Month-over-month comparison
  let diffPercent = 0;
  let direction: 'up' | 'down' | 'equal' = 'equal';
  const diffAmount = totalExpenseThisMonth - totalExpenseLastMonth;

  if (totalExpenseLastMonth > 0) {
    diffPercent = Math.round((Math.abs(diffAmount) / totalExpenseLastMonth) * 100);
    if (diffAmount > 0) direction = 'up';
    else if (diffAmount < 0) direction = 'down';
  } else if (totalExpenseThisMonth > 0) {
    direction = 'up';
    diffPercent = 100;
  }

  // Day with highest spending this month
  const daySpendMap = new Map<string, { amount: number; count: number }>();
  for (const t of thisMonthExpenses) {
    const existing = daySpendMap.get(t.date) || { amount: 0, count: 0 };
    existing.amount += t.amount;
    existing.count += 1;
    daySpendMap.set(t.date, existing);
  }

  let highestExpenseDay: { date: string; amount: number; count: number } | null = null;
  daySpendMap.forEach((val, date) => {
    if (!highestExpenseDay || val.amount > highestExpenseDay.amount) {
      highestExpenseDay = { date, amount: val.amount, count: val.count };
    }
  });

  // Daily average spend (based on days passed so far this month)
  const currentDay = Math.max(1, refDate.getDate());
  const dailyAverageExpense = Math.round(totalExpenseThisMonth / currentDay);

  // Monthly average income across all data
  const incomeTxs = allTransactions.filter((t) => t.type === 'Thu');
  const distinctMonthsWithIncome = new Set(incomeTxs.map((t) => t.date.slice(0, 7))).size || 1;
  const totalAllIncome = incomeTxs.reduce((acc, c) => acc + c.amount, 0);
  const monthlyAverageIncome = Math.round(totalAllIncome / distinctMonthsWithIncome);

  // Savings rate this month
  const savingsRate = totalIncomeThisMonth > 0
    ? Math.round(((totalIncomeThisMonth - totalExpenseThisMonth) / totalIncomeThisMonth) * 100)
    : 0;

  // Cashflow trend
  const netBalance = totalIncomeThisMonth - totalExpenseThisMonth;
  let cashflowTrendStatus: 'dương' | 'âm' | 'cân bằng' = 'dương';
  let cashflowDesc = 'Dòng tiền dương lành mạnh, bạn đang chi tiêu trong khả năng thu nhập';

  if (netBalance < 0) {
    cashflowTrendStatus = 'âm';
    cashflowDesc = 'Dòng tiền thâm hụt (chi tiêu vượt thu nhập), cần rà soát lại các khoản chi lớn';
  } else if (netBalance === 0) {
    cashflowTrendStatus = 'cân bằng';
    cashflowDesc = 'Dòng tiền hòa vốn, chưa trích lập được khoản tiết kiệm thặng dư';
  }

  // Generate alerts
  const alerts: InsightAlert[] = [];

  // Check category surge (e.g. Ăn uống or other category vs last month)
  if (topCategory && topCategory.category) {
    const lastMonthCatExpense = lastMonthExpenses
      .filter((t) => t.category === topCategory.category)
      .reduce((acc, c) => acc + c.amount, 0);

    if (lastMonthCatExpense > 0 && topCategory.amount > lastMonthCatExpense * 1.15) {
      const catPercentUp = Math.round(((topCategory.amount - lastMonthCatExpense) / lastMonthCatExpense) * 100);
      alerts.push({
        id: 'cat-surge',
        type: 'warning',
        icon: '⚠️',
        message: `Chi tiêu ${topCategory.category} tháng này đang cao hơn tháng trước ${catPercentUp}%.`,
        detail: `Đã chi ${formatVND(topCategory.amount)} so với ${formatVND(lastMonthCatExpense)} của tháng trước. Hãy cân đối hạn mức chi tiêu cho nhóm này.`,
      });
    }
  }

  // Savings tip
  if (savingsRate >= 20) {
    alerts.push({
      id: 'savings-great',
      type: 'positive',
      icon: '💡',
      message: `Bạn đang tiết kiệm được ${savingsRate}% thu nhập tháng này.`,
      detail: `Tuyệt vời! Tỷ lệ này vượt mục tiêu tiết kiệm tiêu chuẩn (20%). Bạn có thể cân nhắc chuyển bớt vào quỹ đầu tư tích lũy dài hạn.`,
    });
  } else if (savingsRate > 0) {
    alerts.push({
      id: 'savings-low',
      type: 'tip',
      icon: '💡',
      message: `Tỷ lệ tiết kiệm tháng này đạt ${savingsRate}%.`,
      detail: `Mục tiêu tài chính khuyến nghị thường là 20%. Bạn có thể cắt giảm bớt 5-10% các khoản mua sắm hoặc giải trí không cấp thiết.`,
    });
  } else {
    alerts.push({
      id: 'savings-negative',
      type: 'warning',
      icon: '⚠️',
      message: `Cảnh báo: Chi tiêu đang vượt thu nhập tháng này (-${formatVND(Math.abs(netBalance))}).`,
      detail: `Hãy ưu tiên cắt giảm các khoản chi tiêu tùy ý và tránh phát sinh giao dịch thẻ tín dụng quá hạn.`,
    });
  }

  // Month-over-month total expense alert
  if (direction === 'up' && diffPercent >= 15 && totalExpenseLastMonth > 0) {
    alerts.push({
      id: 'mom-expense-up',
      type: 'warning',
      icon: '📈',
      message: `Tổng chi tiêu tháng này tăng ${diffPercent}% (+${formatVND(diffAmount)}) so với tháng trước.`,
      detail: `Tháng trước bạn chi ${formatVND(totalExpenseLastMonth)}. Hãy kiểm tra các khoản chi đột biến gần đây.`,
    });
  } else if (direction === 'down' && diffPercent >= 10 && totalExpenseLastMonth > 0) {
    alerts.push({
      id: 'mom-expense-down',
      type: 'positive',
      icon: '📉',
      message: `Tổng chi tiêu tháng này giảm ${diffPercent}% (-${formatVND(Math.abs(diffAmount))}) so với tháng trước.`,
      detail: `Bạn đang kiểm soát ngân sách rất kỷ luật so với mức ${formatVND(totalExpenseLastMonth)} của tháng trước.`,
    });
  }

  // Structured metrics
  const metrics: InsightMetric[] = [
    {
      id: 'top-cat',
      title: 'Danh mục tiêu nhiều nhất',
      value: topCategory ? topCategory.category : 'Chưa có',
      subtitle: topCategory ? `${formatVND(topCategory.amount)} (${topCategory.percentage.toFixed(1)}%)` : undefined,
      icon: '🏷️',
      type: 'neutral',
    },
    {
      id: 'month-expense',
      title: 'Tổng chi tiêu tháng này',
      value: formatVND(totalExpenseThisMonth),
      subtitle: totalExpenseLastMonth > 0
        ? `${direction === 'up' ? '▲ Tăng' : direction === 'down' ? '▼ Giảm' : '—'} ${diffPercent}% so với tháng trước`
        : 'Chưa có dữ liệu tháng trước',
      icon: '💸',
      type: direction === 'up' ? 'warning' : 'success',
    },
    {
      id: 'highest-day',
      title: 'Ngày chi nhiều nhất',
      value: highestExpenseDay ? formatDateVN(highestExpenseDay.date) : 'Chưa có',
      subtitle: highestExpenseDay ? `${formatVND(highestExpenseDay.amount)} (${highestExpenseDay.count} giao dịch)` : undefined,
      icon: '📅',
      type: 'neutral',
    },
    {
      id: 'daily-avg',
      title: 'Chi tiêu trung bình / ngày',
      value: formatVND(dailyAverageExpense),
      subtitle: `Tính trên ${currentDay} ngày đã qua trong tháng`,
      icon: '⏱️',
      type: 'neutral',
    },
    {
      id: 'monthly-income-avg',
      title: 'Thu nhập TB mỗi tháng',
      value: formatVND(monthlyAverageIncome),
      subtitle: `Dựa trên lịch sử thu nhập đã ghi nhận`,
      icon: '💼',
      type: 'neutral',
    },
    {
      id: 'cashflow-trend',
      title: 'Xu hướng dòng tiền',
      value: cashflowTrendStatus === 'dương' ? 'Đang tăng trưởng' : cashflowTrendStatus === 'âm' ? 'Thâm hụt' : 'Cân bằng',
      subtitle: `${netBalance >= 0 ? '+' : ''}${formatVND(netBalance)} thặng dư dòng tiền`,
      icon: '📊',
      type: cashflowTrendStatus === 'dương' ? 'success' : 'warning',
    },
  ];

  return {
    topCategory,
    totalExpenseThisMonth,
    expenseComparisonWithLastMonth: {
      diffAmount,
      diffPercent,
      direction,
      lastMonthExpense: totalExpenseLastMonth,
    },
    highestExpenseDay,
    monthlyAverageIncome,
    dailyAverageExpense,
    savingsRate,
    cashflowTrend: {
      status: cashflowTrendStatus,
      description: cashflowDesc,
      netBalance,
    },
    metrics,
    alerts,
  };
}
