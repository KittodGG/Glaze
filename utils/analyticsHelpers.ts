import { Transaction } from '@/store/transactionStore';

interface CategoryData {
    name: string;
    amount: number;
    percentage: number;
    color: string;
    icon: string;
}

interface WeeklyData {
    day: string;
    amount: number;
    isToday: boolean;
}

interface SpendingStats {
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
    weekOverWeekChange: number; // percentage
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
 * Get category breakdown from transactions
 */
export function getCategoryBreakdown(transactions: Transaction[]): CategoryData[] {
    const { start, end } = getCurrentWeekRange();
    const weeklyTransactions = filterTransactionsByDateRange(transactions, start, end);

    // Group by category
    const categoryTotals: Record<string, number> = {};
    weeklyTransactions.forEach(t => {
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
 * Get weekly spending data for chart
 */
export function getWeeklySpending(transactions: Transaction[]): WeeklyData[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const { start } = getCurrentWeekRange();
    const today = new Date();
    const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

    // Initialize daily totals
    const dailyTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

    // Sum transactions by day
    transactions.forEach(t => {
        const date = new Date(t.date);
        const dayDiff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff >= 0 && dayDiff < 7) {
            dailyTotals[dayDiff] += t.amount;
        }
    });

    return days.map((day, index) => ({
        day,
        amount: dailyTotals[index],
        isToday: index === todayDayIndex,
    }));
}

/**
 * Get spending statistics
 */
export function getSpendingStats(transactions: Transaction[]): SpendingStats {
    const { start: thisWeekStart, end: thisWeekEnd } = getCurrentWeekRange();
    const { start: lastWeekStart, end: lastWeekEnd } = getLastWeekRange();

    const thisWeekTransactions = filterTransactionsByDateRange(transactions, thisWeekStart, thisWeekEnd);
    const lastWeekTransactions = filterTransactionsByDateRange(transactions, lastWeekStart, lastWeekEnd);

    const thisWeekTotal = thisWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastWeekTotal = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0);

    const weekOverWeekChange = lastWeekTotal > 0
        ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : 0;

    return {
        totalSpent: thisWeekTotal,
        transactionCount: thisWeekTransactions.length,
        averageTransaction: thisWeekTransactions.length > 0
            ? Math.round(thisWeekTotal / thisWeekTransactions.length)
            : 0,
        weekOverWeekChange,
    };
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

    // Week-over-week increase
    if (stats.weekOverWeekChange > 20) {
        return {
            emoji: '📈',
            title: 'Spending is up!',
            message: `You're spending ${stats.weekOverWeekChange}% more than last week. Time to slow down?`,
        };
    }

    // Week-over-week decrease
    if (stats.weekOverWeekChange < -20) {
        return {
            emoji: '💪',
            title: 'Great job saving!',
            message: `You're spending ${Math.abs(stats.weekOverWeekChange)}% less than last week. Keep it up!`,
        };
    }

    // Default insight - top category
    return {
        emoji: '💸',
        title: 'Top spending category',
        message: `${topCategory.name} took ${topCategory.percentage}% of your spending this week.`,
    };
}
