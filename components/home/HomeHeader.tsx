import { useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface HomeHeaderProps {
    showChallengeBadge?: boolean;
}

export function HomeHeader({ showChallengeBadge = false }: HomeHeaderProps) {
    const router = useRouter();
    const transactions = useTransactionStore((s) => s.transactions);
    const wallets = useWalletStore((s) => s.wallets);

    // Calculate financial health based on real data
    const { healthScore, healthLabel, healthColor } = useMemo(() => {
        if (transactions.length === 0) {
            return { healthScore: 0, healthLabel: 'Start tracking!', healthColor: '#6B7280' };
        }

        const thisMonth = new Date();
        const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
        
        let monthlyIncome = 0;
        let monthlyExpense = 0;

        transactions.forEach((t) => {
            const txDate = new Date(t.date);
            if (txDate >= monthStart) {
                if (t.type === 'income') {
                    monthlyIncome += t.amount;
                } else {
                    monthlyExpense += t.amount;
                }
            }
        });

        // Calculate savings rate
        const savingsRate = monthlyIncome > 0 
            ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 
            : 0;

        // Determine health score (0-100)
        let score = 50; // base score
        
        if (savingsRate >= 30) score = 90;
        else if (savingsRate >= 20) score = 80;
        else if (savingsRate >= 10) score = 70;
        else if (savingsRate >= 0) score = 60;
        else if (savingsRate >= -20) score = 40;
        else score = 20;

        // Add bonus for having wallets
        if (wallets.length >= 2) score = Math.min(100, score + 5);

        let label = '';
        let color = '';

        if (score >= 80) {
            label = 'Excellent!';
            color = '#22C55E';
        } else if (score >= 60) {
            label = 'Good';
            color = '#84CC16';
        } else if (score >= 40) {
            label = 'Fair';
            color = '#F59E0B';
        } else {
            label = 'Needs attention';
            color = '#EF4444';
        }

        return { healthScore: Math.round(score), healthLabel: label, healthColor: color };
    }, [transactions, wallets]);

    // Get greeting based on time
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.greetingRow}>
                    <Text style={styles.greeting}>{greeting}</Text>
                    {showChallengeBadge && (
                        <MotiView
                            from={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring' }}
                            style={styles.challengeBadge}
                        >
                            <Ionicons name="flame" size={14} color="#fff" />
                        </MotiView>
                    )}
                </View>
                
                {/* Financial Health Indicator */}
                <Pressable 
                    onPress={() => router.push('/analytics')}
                    style={styles.healthContainer}
                >
                    <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
                    <Text style={styles.healthText}>
                        {transactions.length > 0 ? `Health: ${healthScore}%` : healthLabel}
                    </Text>
                    <Text style={[styles.healthLabel, { color: healthColor }]}>
                        {transactions.length > 0 ? healthLabel : ''}
                    </Text>
                </Pressable>
            </View>

            {/* Profile Avatar - Navigates to Settings */}
            <Pressable 
                onPress={() => router.push('/profile')}
                style={({ pressed }) => [
                    styles.avatarContainer,
                    { opacity: pressed ? 0.8 : 1 }
                ]}
            >
                <LinearGradient
                    colors={['#A855F7', '#7C3AED']}
                    style={styles.avatar}
                >
                    <Ionicons name="person" size={22} color="#fff" />
                </LinearGradient>
                {/* Notification dot if there's a challenge */}
                {showChallengeBadge && (
                    <View style={styles.notificationDot} />
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
        marginTop: 10,
    },
    leftSection: {
        flex: 1,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    greeting: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 26,
        color: '#fff',
    },
    challengeBadge: {
        backgroundColor: '#F97316',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    healthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 6,
    },
    healthDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    healthText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    healthLabel: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 13,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    notificationDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#1a1a2e',
    },
});
