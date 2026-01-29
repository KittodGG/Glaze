import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function BalanceCard() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const transactions = useTransactionStore((s) => s.transactions);

    // Calculate totals
    const { totalIncome, totalExpense, balance } = useMemo(() => {
        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += t.amount;
            }
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
        };
    }, [transactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.container}
        >
            <BlurView
                intensity={60}
                tint={colorScheme}
                style={styles.blurContainer}
            >
                <LinearGradient
                    colors={colorScheme === 'dark'
                        ? ['rgba(168, 85, 247, 0.15)', 'rgba(99, 102, 241, 0.1)']
                        : ['rgba(168, 85, 247, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                >
                    {/* Balance Section */}
                    <View style={styles.balanceSection}>
                        <Text style={[styles.balanceLabel, { color: colors.icon }]}>
                            Total Balance
                        </Text>
                        <Text style={[styles.balanceAmount, { color: colors.text }]}>
                            {formatCurrency(balance)}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

                    {/* Income/Expense Row */}
                    <View style={styles.statsRow}>
                        {/* Income */}
                        <View style={styles.statItem}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                                <Ionicons name="arrow-up" size={16} color="#22C55E" />
                            </View>
                            <View>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Income</Text>
                                <Text style={[styles.statAmount, { color: '#22C55E' }]}>
                                    {formatCurrency(totalIncome)}
                                </Text>
                            </View>
                        </View>

                        {/* Expense */}
                        <View style={styles.statItem}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                                <Ionicons name="arrow-down" size={16} color="#EF4444" />
                            </View>
                            <View>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Expense</Text>
                                <Text style={[styles.statAmount, { color: '#EF4444' }]}>
                                    {formatCurrency(totalExpense)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </BlurView>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
    },
    blurContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    gradientOverlay: {
        padding: 24,
    },
    balanceSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    balanceLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        marginBottom: 8,
    },
    balanceAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 36,
        letterSpacing: -1,
    },
    divider: {
        height: 1,
        marginBottom: 20,
        opacity: 0.3,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        marginBottom: 2,
    },
    statAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
    },
});
