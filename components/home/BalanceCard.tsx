import { useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function BalanceCard() {
    const transactions = useTransactionStore((s) => s.transactions);
    const wallets = useWalletStore((s) => s.wallets);

    const walletTotal = useMemo(() => {
        return wallets.reduce((sum, w) => sum + w.balance, 0);
    }, [wallets]);

    const { monthlyIncome, monthlyExpense, monthlyBalance } = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
            const txDate = new Date(t.date);
            if (txDate >= monthStart) {
                if (t.type === 'income') {
                    income += t.amount;
                } else {
                    expense += t.amount;
                }
            }
        });

        return {
            monthlyIncome: income,
            monthlyExpense: expense,
            monthlyBalance: income - expense,
        };
    }, [transactions]);

    const formatCurrency = (amount: number, short: boolean = false) => {
        if (short && Math.abs(amount) >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1)}M`;
        }
        if (short && Math.abs(amount) >= 1000) {
            return `Rp ${(amount / 1000).toFixed(0)}k`;
        }
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const monthName = new Date().toLocaleDateString('id-ID', { month: 'long' });

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.container}
        >
            {/* Background card layer (creates depth effect) */}
            <View style={styles.backCard} />
            
            {/* Main glassmorphism card */}
            <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
                <View style={styles.glassContent}>
                    {/* Subtle accent glow */}
                    <View style={styles.accentGlow} />
                    
                    {/* Total Wallet Balance */}
                    <View style={styles.topSection}>
                        <View style={styles.labelRow}>
                            <View style={styles.walletIconBg}>
                                <Ionicons name="wallet" size={14} color="#A855F7" />
                            </View>
                            <Text style={styles.label}>Total Balance</Text>
                        </View>
                        <Text style={styles.mainAmount}>{formatCurrency(walletTotal)}</Text>
                        <Text style={styles.walletCount}>
                            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} connected
                        </Text>
                    </View>

                    {/* Monthly Stats - Inner card */}
                    <View style={styles.innerCard}>
                        <Text style={styles.monthLabel}>{monthName}</Text>
                        
                        <View style={styles.statsRow}>
                            {/* Income */}
                            <View style={styles.statItem}>
                                <View style={[styles.statIcon, styles.incomeIcon]}>
                                    <Ionicons name="trending-up" size={14} color="#22C55E" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>Income</Text>
                                    <Text style={[styles.statAmount, { color: '#22C55E' }]}>
                                        +{formatCurrency(monthlyIncome, true)}
                                    </Text>
                                </View>
                            </View>

                            {/* Expense */}
                            <View style={styles.statItem}>
                                <View style={[styles.statIcon, styles.expenseIcon]}>
                                    <Ionicons name="trending-down" size={14} color="#EF4444" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>Expense</Text>
                                    <Text style={[styles.statAmount, { color: '#EF4444' }]}>
                                        -{formatCurrency(monthlyExpense, true)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Net Balance */}
                        <View style={styles.netSection}>
                            <Text style={styles.netLabel}>Net</Text>
                            <View style={[
                                styles.netBadge,
                                { backgroundColor: monthlyBalance >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }
                            ]}>
                                <Text style={[
                                    styles.netAmount,
                                    { color: monthlyBalance >= 0 ? '#22C55E' : '#EF4444' }
                                ]}>
                                    {monthlyBalance >= 0 ? '+' : ''}{formatCurrency(monthlyBalance, true)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </BlurView>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 16,
        position: 'relative',
    },
    backCard: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        bottom: -8,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderRadius: 24,
    },
    blurContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    glassContent: {
        padding: 20,
        backgroundColor: 'rgba(30, 30, 50, 0.6)',
        position: 'relative',
        overflow: 'hidden',
    },
    accentGlow: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
    topSection: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    walletIconBg: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    mainAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 30,
        color: '#fff',
        letterSpacing: -0.5,
    },
    walletCount: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 4,
    },
    innerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    monthLabel: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    incomeIcon: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    expenseIcon: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    statLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
    statAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
    },
    netSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    netLabel: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    netBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    netAmount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
    },
});
