import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { getCategoryBreakdown, getSpendingStats, getWeeklySpending } from '@/utils/analyticsHelpers';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TimeRange = 'week' | 'month' | 'year';


export default function AnalyticsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { top } = useSafeAreaInsets();
    const isAndroid = Platform.OS === 'android';
    const [timeRange, setTimeRange] = useState<TimeRange>('week');

    // Get real data from stores
    const transactions = useTransactionStore((s) => s.transactions);
    const wallets = useWalletStore((s) => s.wallets);

    // Compute analytics from real transaction data
    const CATEGORY_DATA = useMemo(() => getCategoryBreakdown(transactions), [transactions]);
    const WEEKLY_DATA = useMemo(() => getWeeklySpending(transactions), [transactions]);
    const stats = useMemo(() => getSpendingStats(transactions), [transactions]);
    const totalBudget = useMemo(() => wallets.reduce((sum, w) => sum + w.balance, 0), [wallets]);
    const budgetUsed = stats.totalSpent;
    const budgetPercentage = totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0;

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
                                <Text style={styles.budgetFooterLabel}>Spent This Week</Text>
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

                        <View style={styles.chartContainer}>
                            {WEEKLY_DATA.map((day, index) => {
                                const maxAmount = Math.max(...WEEKLY_DATA.map(d => d.amount));
                                const barHeight = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                                const isHighest = day.amount === maxAmount && day.amount > 0;
                                return (
                                    <View key={day.day} style={styles.barWrapper}>
                                        <MotiView
                                            from={{ height: 0 }}
                                            animate={{ height: barHeight * 1.5 }}
                                            transition={{ type: 'spring', delay: index * 50 }}
                                            style={[
                                                styles.bar,
                                                { backgroundColor: isHighest ? '#A855F7' : 'rgba(168, 85, 247, 0.3)' }
                                            ]}
                                        />
                                        <Text style={[styles.barLabel, { color: 'rgba(255,255,255,0.7)' }]}>{day.day}</Text>
                                    </View>
                                );
                            })}
                        </View>
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
                        { label: 'vs Last Week', value: `${stats.weekOverWeekChange >= 0 ? '+' : ''}${stats.weekOverWeekChange}%` }
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
});
