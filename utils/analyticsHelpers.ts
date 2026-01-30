import { Transaction } from '@/store/transactionStore';

export type TimeRange = 'week' | 'month' | 'year';

export interface CategoryData {
    name: string;
    amount: number;
    percentage: number;
    color: string;
    icon: string;
}

export interface ChartData {
    label: string;
    amount: number;
    isActive: boolean;
}

export interface SpendingStats {
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
    periodChange: number; // percentage compared to previous period
}

// Color palette for categories
const CATEGORY_COLORS: Record<string, string> = {
    'Food': '#F59E0B',
    'Drink': '#8B5CF6',
    'Transport': '#3B82F6',
    'Shopping': '#EC4899',
    'Entertainment': '#10B981',
    'Bills': '#EF4444',
    'Health': '#14B8A6',
    'Education': '#6366F1',
    'Subscription': '#F97316',
    'Other': '#6B7280',
};

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, string> = {
    'Food': 'fast-food',
    'Drink': 'cafe',
    'Transport': 'car',
    'Shopping': 'cart',
    'Entertainment': 'game-controller',
    'Bills': 'receipt',
    'Health': 'medkit',
    'Education': 'school',
    'Subscription': 'film',
    'Other': 'pricetag',
};

/**
 * Get the start and end of the current week (Monday to Sunday)
 */
function getCurrentWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start

    const start = new Date(now);
    start.setDate(now.getDate() - diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

/**
 * Get the start and end of last week
 */
function getLastWeekRange(): { start: Date; end: Date } {
    const { start: thisWeekStart } = getCurrentWeekRange();

    const end = new Date(thisWeekStart);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    return { start, end };
}

/**
 * Get the start and end of the current month
 */
function getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
}

/**
 * Get the start and end of last month
 */
function getLastMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
}

/**
 * Get the start and end of the current year
 */
function getCurrentYearRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
}

/**
 * Get the start and end of last year
 */
function getLastYearRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, 0, 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now.getFullYear() - 1, 11, 31);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
}

/**
 * Get date range based on time range
 */
export function getDateRange(timeRange: TimeRange): { current: { start: Date; end: Date }, previous: { start: Date; end: Date } } {
    switch (timeRange) {
        case 'month':
            return { current: getCurrentMonthRange(), previous: getLastMonthRange() };
        case 'year':
            return { current: getCurrentYearRange(), previous: getLastYearRange() };
        default:
            return { current: getCurrentWeekRange(), previous: getLastWeekRange() };
    }
}

/**
 * Filter transactions within a date range
 */
function filterTransactionsByDateRange(
    transactions: Transaction[],
    start: Date,
    end: Date
): Transaction[] {
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
    });
}

/**
 * Get category breakdown from transactions with time range support
 */
export function getCategoryBreakdown(transactions: Transaction[], timeRange: TimeRange = 'week'): CategoryData[] {
    const { current } = getDateRange(timeRange);
    const filteredTransactions = filterTransactionsByDateRange(transactions, current.start, current.end);

    // Only count expenses for category breakdown
    const expenseTransactions = filteredTransactions.filter(t => t.type !== 'income');

    // Group by category
    const categoryTotals: Record<string, number> = {};
    expenseTransactions.forEach(t => {
        const category = t.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
    });

    // Calculate total for percentages
    const total = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);

    // Convert to array and sort by amount
    const categories: CategoryData[] = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
            color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Other'],
            icon: CATEGORY_ICONS[name] || CATEGORY_ICONS['Other'],
        }))
        .sort((a, b) => b.amount - a.amount);

    // Return top categories, group rest as "Other" if needed
    if (categories.length > 5) {
        const topCategories = categories.slice(0, 4);
        const otherAmount = categories.slice(4).reduce((sum, c) => sum + c.amount, 0);
        topCategories.push({
            name: 'Other',
            amount: otherAmount,
            percentage: total > 0 ? Math.round((otherAmount / total) * 100) : 0,
            color: CATEGORY_COLORS['Other'],
            icon: CATEGORY_ICONS['Other'],
        });
        return topCategories;
    }

    return categories;
}

/**
 * Get chart data based on time range
 */
export function getChartData(transactions: Transaction[], timeRange: TimeRange = 'week'): ChartData[] {
    const { current } = getDateRange(timeRange);
    const now = new Date();

    if (timeRange === 'week') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const todayDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const dailyTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

        transactions.forEach(t => {
            const date = new Date(t.date);
            const dayDiff = Math.floor((date.getTime() - current.start.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff >= 0 && dayDiff < 7 && t.type !== 'income') {
                dailyTotals[dayDiff] += t.amount;
            }
        });

        return days.map((label, index) => ({
            label,
            amount: dailyTotals[index],
            isActive: index === todayDayIndex,
        }));
    } else if (timeRange === 'month') {
        const weeks = ['W1', 'W2', 'W3', 'W4', 'W5'];
        const currentWeekOfMonth = Math.floor((now.getDate() - 1) / 7);
        const weeklyTotals: number[] = [0, 0, 0, 0, 0];

        transactions.forEach(t => {
            const date = new Date(t.date);
            if (date >= current.start && date <= current.end && t.type !== 'income') {
                const weekIndex = Math.floor((date.getDate() - 1) / 7);
                if (weekIndex >= 0 && weekIndex < 5) {
                    weeklyTotals[weekIndex] += t.amount;
                }
            }
        });

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const numWeeks = Math.ceil(daysInMonth / 7);
        return weeks.slice(0, numWeeks).map((label, index) => ({
            label,
            amount: weeklyTotals[index],
            isActive: index === currentWeekOfMonth,
        }));
    } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = now.getMonth();
        const monthlyTotals: number[] = Array(12).fill(0);

        transactions.forEach(t => {
            const date = new Date(t.date);
            if (date >= current.start && date <= current.end && t.type !== 'income') {
                monthlyTotals[date.getMonth()] += t.amount;
            }
        });

        return months.map((label, index) => ({
            label,
            amount: monthlyTotals[index],
            isActive: index === currentMonth,
        }));
    }
}

/**
 * Get spending statistics with time range support
 */
export function getSpendingStats(transactions: Transaction[], timeRange: TimeRange = 'week'): SpendingStats {
    const { current, previous } = getDateRange(timeRange);

    const currentTransactions = filterTransactionsByDateRange(transactions, current.start, current.end);
    const previousTransactions = filterTransactionsByDateRange(transactions, previous.start, previous.end);

    // Only count expenses
    const currentExpenses = currentTransactions.filter(t => t.type !== 'income');
    const previousExpenses = previousTransactions.filter(t => t.type !== 'income');

    const currentTotal = currentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previousExpenses.reduce((sum, t) => sum + t.amount, 0);

    const periodChange = previousTotal > 0
        ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
        : 0;

    return {
        totalSpent: currentTotal,
        transactionCount: currentExpenses.length,
        averageTransaction: currentExpenses.length > 0
            ? Math.round(currentTotal / currentExpenses.length)
            : 0,
        periodChange,
    };
}

/**
 * Get filtered transactions by time range
 */
export function getFilteredTransactions(transactions: Transaction[], timeRange: TimeRange = 'week'): Transaction[] {
    const { current } = getDateRange(timeRange);
    return filterTransactionsByDateRange(transactions, current.start, current.end)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Generate a spending insight message
 */
export function generateInsight(transactions: Transaction[]): { emoji: string; title: string; message: string } {
    const categories = getCategoryBreakdown(transactions);
    const stats = getSpendingStats(transactions);

    // No transactions this week
    if (stats.transactionCount === 0) {
        return {
            emoji: '🎉',
            title: 'No spending yet!',
            message: 'You haven\'t spent anything this week. Keep it up or treat yourself!',
        };
    }

    // Get top category
    const topCategory = categories[0];

    // High spending on food/drinks
    if ((topCategory.name === 'Food' || topCategory.name === 'Drink') && topCategory.percentage > 40) {
        return {
            emoji: '🔥',
            title: 'Roasting your spending',
            message: `You spent Rp ${(topCategory.amount / 1000).toFixed(0)}k on ${topCategory.name.toLowerCase()} this week? Seriously?`,
        };
    }

    // Period increase
    if (stats.periodChange > 20) {
        return {
            emoji: '📈',
            title: 'Spending is up!',
            message: `You're spending ${stats.periodChange}% more than last week. Time to slow down?`,
        };
    }

    // Period decrease
    if (stats.periodChange < -20) {
        return {
            emoji: '💪',
            title: 'Great job saving!',
            message: `You're spending ${Math.abs(stats.periodChange)}% less than last week. Keep it up!`,
        };
    }

    // Default insight - top category
    return {
        emoji: '💸',
        title: 'Top spending category',
        message: `${topCategory.name} took ${topCategory.percentage}% of your spending this week.`,
    };
}
