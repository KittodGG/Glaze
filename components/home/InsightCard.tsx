import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Transaction, useTransactionStore } from '@/store/transactionStore';

function generateInsight(transactions: Transaction[]) {
    if (transactions.length === 0) {
        return {
            emoji: '✨',
            title: 'Start tracking!',
            desc: 'Add your first transaction to get personalized insights.',
        };
    }

    // Calculate category totals
    const categoryTotals: Record<string, number> = {};
    for (const tx of transactions) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    }

    // Find top spending category
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    if (topCategory) {
        const [category, amount] = topCategory;
        const formatted = (amount / 1000).toFixed(0);
        return {
            emoji: '🔥',
            title: 'Roasting your spending',
            desc: `You spent ${formatted}k on ${category.toLowerCase()} recently. What's up with that?`,
        };
    }

    return {
        emoji: '📊',
        title: 'Spending overview',
        desc: `Total spent: Rp ${(totalSpent / 1000).toFixed(0)}k across ${transactions.length} transactions.`,
    };
}

export function InsightCard() {
    const transactions = useTransactionStore((s) => s.transactions);
    const insight = useMemo(() => generateInsight(transactions), [transactions]);

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: 'spring' }}
            style={styles.container}
        >
            <GlassView intensity={60} containerStyle={styles.glassContainer}>
                <LinearGradient
                    // Vibrant dichroic-inspired colors (purple/pink/magenta)
                    colors={['rgba(168, 85, 247, 0.6)', 'rgba(236, 72, 153, 0.5)', 'rgba(99, 102, 241, 0.4)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.glowOverlay} />
                    <Text style={styles.emoji}>{insight.emoji}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{insight.title}</Text>
                        <Text style={styles.desc}>{insight.desc}</Text>
                    </View>
                </LinearGradient>
            </GlassView>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    glassContainer: {
        borderRadius: 24,
    },
    card: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    glowOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    emoji: {
        fontSize: 32,
        marginRight: 16,
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    desc: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.95)',
        lineHeight: 20,
    },
});
