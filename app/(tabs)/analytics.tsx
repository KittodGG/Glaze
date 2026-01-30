import { GlassCard } from '@/components/ui/GlassCard';
import { GlassView } from '@/components/ui/GlassView';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Transaction, useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { getCategoryBreakdown, getChartData, getFilteredTransactions, getSpendingStats, TimeRange } from '@/utils/analyticsHelpers';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function AnalyticsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { top } = useSafeAreaInsets();
    const isAndroid = Platform.OS === 'android';
    const [timeRange, setTimeRange] = useState<TimeRange>('week');

    // Get real data from stores
    const transactions = useTransactionStore((s) => s.transactions);
    const wallets = useWalletStore((s) => s.wallets);

    // Compute analytics from real transaction data with time range
    const CATEGORY_DATA = useMemo(() => getCategoryBreakdown(transactions, timeRange), [transactions, timeRange]);
    const CHART_DATA = useMemo(() => getChartData(transactions, timeRange), [transactions, timeRange]);
    const stats = useMemo(() => getSpendingStats(transactions, timeRange), [transactions, timeRange]);
    const filteredTransactions = useMemo(() => getFilteredTransactions(transactions, timeRange), [transactions, timeRange]);
    const totalBudget = useMemo(() => wallets.reduce((sum, w) => sum + w.balance, 0), [wallets]);
    const budgetUsed = stats.totalSpent;
    const budgetPercentage = totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0;

    const getPeriodLabel = () => {
        switch (timeRange) {
            case 'month': return 'This Month';
            case 'year': return 'This Year';
            default: return 'This Week';
        }
    };

    const getPreviousPeriodLabel = () => {
        switch (timeRange) {
            case 'month': return 'vs Last Month';
            case 'year': return 'vs Last Year';
            default: return 'vs Last Week';
        }
    };

    return (
        <PremiumBackground>
            <ScrollView
                contentContainerStyle={{ paddingTop: top + 20, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: '#fff' }]}>Analytics</Text>
                </View>

                {/* Time Range Selector */}
                <View style={styles.timeSelector}>
                    {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
                        <Pressable
                            key={range}
                            onPress={() => setTimeRange(range)}
                            style={[
                                styles.timeButton,
                                timeRange === range && styles.timeButtonActive
                            ]}
                        >
                            <Text style={[
                                styles.timeButtonText,
                                { color: timeRange === range ? '#fff' : colors.icon }
                            ]}>
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Budget Overview Card */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <LinearGradient
                        colors={['#7C3AED', '#A855F7', '#C084FC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.budgetCard}
                    >
                        <View style={styles.budgetHeader}>
                            <Text style={styles.budgetLabel}>Monthly Budget</Text>
                            <View style={styles.budgetBadge}>
                                <Text style={styles.budgetBadgeText}>{Math.round(budgetPercentage)}% used</Text>
                            </View>
                        </View>

                        <Text style={styles.budgetAmount}>Rp {budgetUsed.toLocaleString('id-ID')}</Text>
                        <Text style={styles.budgetSubtext}>of Rp {totalBudget.toLocaleString('id-ID')}</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBg}>
                                <MotiView
                                    from={{ width: '0%' }}
                                    animate={{ width: `${Math.min(budgetPercentage, 100)}%` as any }}
                                    transition={{ type: 'timing', duration: 1000 }}
                                    style={styles.progressFill}
                                />
                            </View>
                        </View>

                        <View style={styles.budgetFooter}>
                            <View>
                                <Text style={styles.budgetFooterLabel}>Total Balance</Text>
                                <Text style={styles.budgetFooterValue}>Rp {totalBudget.toLocaleString('id-ID')}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.budgetFooterLabel}>Spent {getPeriodLabel()}</Text>
                                <Text style={styles.budgetFooterValue}>Rp {budgetUsed.toLocaleString('id-ID')}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </MotiView>

                {/* Spending Chart */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500, delay: 100 }}
                >
                    <GlassCard style={styles.card}>
                        <Text style={[styles.cardTitle, { color: '#fff' }]}>Spending Trend</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={[styles.chartContainer, { minWidth: timeRange === 'year' ? 400 : undefined }]}>
                                {CHART_DATA.map((item, index) => {
                                    const maxAmount = Math.max(...CHART_DATA.map(d => d.amount));
                                    const barHeight = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                                    const isHighest = item.amount === maxAmount && item.amount > 0;
                                    return (
                                        <View key={item.label} style={styles.barWrapper}>
                                            <MotiView
                                                from={{ height: 0 }}
                                                animate={{ height: barHeight * 1.5 }}
                                                transition={{ type: 'spring', delay: index * 50 }}
                                                style={[
                                                    styles.bar,
                                                    { backgroundColor: item.isActive ? '#A855F7' : (isHighest ? '#A855F7' : 'rgba(168, 85, 247, 0.3)') }
                                                ]}
                                            />
                                            <Text style={[styles.barLabel, { color: item.isActive ? '#A855F7' : 'rgba(255,255,255,0.7)' }]}>{item.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </GlassCard>
                </MotiView>

                {/* Category Breakdown */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500, delay: 200 }}
                >
                    <GlassCard style={styles.card}>
                        <Text style={[styles.cardTitle, { color: '#fff' }]}>By Category</Text>

                        {CATEGORY_DATA.map((category, index) => (
                            <MotiView
                                key={category.name}
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ type: 'timing', delay: 300 + index * 100 }}
                                style={styles.categoryItem}
                            >
                                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                                    <Ionicons name={category.icon as any} size={20} color={category.color} />
                                </View>

                                <View style={styles.categoryInfo}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={[styles.categoryName, { color: '#fff' }]}>{category.name}</Text>
                                        <Text style={[styles.categoryAmount, { color: '#fff' }]}>
                                            Rp {category.amount.toLocaleString('id-ID')}
                                        </Text>
                                    </View>

                                    <View style={styles.categoryProgressBg}>
                                        <MotiView
                                            from={{ width: '0%' }}
                                            animate={{ width: `${category.percentage}%` as any }}
                                            transition={{ type: 'timing', duration: 800, delay: 400 + index * 100 }}
                                            style={[styles.categoryProgressFill, { backgroundColor: category.color }]}
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.categoryPercent, { color: 'rgba(255,255,255,0.7)' }]}>{category.percentage}%</Text>
                            </MotiView>
                        ))}
                    </GlassCard>
                </MotiView>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'Transactions', value: stats.transactionCount.toString() },
                        { label: 'Avg/Transaction', value: `Rp ${(stats.averageTransaction / 1000).toFixed(0)}k` },
                        { label: getPreviousPeriodLabel(), value: `${stats.periodChange >= 0 ? '+' : ''}${stats.periodChange}%` }
                    ].map((stat, index) => (
                        <MotiView
                            key={index}
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', delay: 400 + index * 100 }}
                            style={{ flex: 1 }}
                        >
                            <GlassCard style={styles.statCard}>
                                <Text style={[styles.statValue, { color: '#fff' }]}>{stat.value}</Text>
                                <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>{stat.label}</Text>
                            </GlassCard>
                        </MotiView>
                    ))}
                </View>

                {/* Transaction History */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500, delay: 300 }}
                    style={{ marginTop: 20 }}
                >
                    <GlassCard style={styles.card}>
                        <Text style={[styles.cardTitle, { color: '#fff' }]}>Transaction History</Text>

                        {filteredTransactions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="wallet-outline" size={48} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyStateText}>No transactions {getPeriodLabel().toLowerCase()}</Text>
                            </View>
                        ) : (
                            filteredTransactions.slice(0, 10).map((item, index) => (
                                <MotiView
                                    key={item.id}
                                    from={{ opacity: 0, translateX: -20 }}
                                    animate={{ opacity: 1, translateX: 0 }}
                                    transition={{ type: 'timing', delay: 400 + index * 50 }}
                                    style={styles.historyItem}
                                >
                                    <View style={styles.historyIconBox}>
                                        <Ionicons name={(item.icon || 'pricetag') as any} size={18} color="#fff" />
                                    </View>
                                    <View style={styles.historyInfo}>
                                        <Text style={styles.historyTitle}>{item.title}</Text>
                                        <Text style={styles.historyDate}>
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {item.source_wallet}
                                        </Text>
                                    </View>
                                    <Text style={[styles.historyAmount, { color: item.type === 'income' ? '#22C55E' : '#EF4444' }]}>
                                        {item.type === 'income' ? '+' : '-'}Rp {item.amount.toLocaleString('id-ID')}
                                    </Text>
                                </MotiView>
                            ))
                        )}
                        
                        {filteredTransactions.length > 10 && (
                            <Text style={styles.moreText}>+{filteredTransactions.length - 10} more transactions</Text>
                        )}
                    </GlassCard>
                </MotiView>
            </ScrollView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 32,
    },
    timeSelector: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderRadius: 12,
        padding: 4,
    },
    timeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    timeButtonActive: {
        backgroundColor: '#A855F7',
    },
    timeButtonText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
    },
    budgetCard: {
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    budgetLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    budgetBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    budgetBadgeText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 12,
        color: '#fff',
    },
    budgetAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 36,
        color: '#fff',
    },
    budgetSubtext: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 16,
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetFooterLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    budgetFooterValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#fff',
    },
    card: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    cardTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        marginBottom: 20,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 180,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 28,
        borderRadius: 8,
        marginBottom: 8,
    },
    barLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    categoryName: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
    },
    categoryAmount: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
    },
    categoryProgressBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    categoryProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    categoryPercent: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        marginLeft: 12,
        width: 40,
        textAlign: 'right',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    statCard: {
        borderRadius: 20,
        alignItems: 'center',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 24,
    },
    statLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    historyIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyTitle: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: '#fff',
    },
    historyDate: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    historyAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
    },
    moreText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: 16,
    },
});
