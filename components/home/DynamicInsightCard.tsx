import { DailyInsight, getDailyInsight, InsightTheme } from '@/services/insightService';
import { useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHALLENGE_KEY = 'glaze_challenge_active';

// Theme gradient configurations
const THEME_GRADIENTS: Record<InsightTheme, readonly [string, string, ...string[]]> = {
    danger: ['#FF6B6B', '#EE5A24', '#FF4757', '#C0392B'],
    success: ['#00D9A5', '#11998e', '#38ef7d', '#00B894'],
    info: ['#A855F7', '#6366F1', '#8B5CF6', '#7C3AED'],
};

const THEME_GLOW: Record<InsightTheme, string> = {
    danger: 'rgba(255, 107, 107, 0.4)',
    success: 'rgba(0, 217, 165, 0.4)',
    info: 'rgba(168, 85, 247, 0.4)',
};

interface DynamicInsightCardProps {
    onChallengeAccepted?: () => void;
}

export function DynamicInsightCard({ onChallengeAccepted }: DynamicInsightCardProps) {
    const router = useRouter();
    const transactions = useTransactionStore((s) => s.transactions);
    const wallets = useWalletStore((s) => s.wallets);

    const [insight, setInsight] = useState<DailyInsight | null>(null);
    const [loading, setLoading] = useState(true);
    const [isChallengeActive, setIsChallengeActive] = useState(false);

    // Animation values
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        loadInsight();
        checkChallengeStatus();
    }, [transactions, wallets]);

    useEffect(() => {
        if (insight && !loading) {
            // Animate in
            translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
            opacity.value = withSpring(1, { damping: 20 });
            scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        }
    }, [insight, loading]);

    const loadInsight = async () => {
        if (transactions.length === 0) {
            setLoading(false);
            return;
        }

        try {
            const data = await getDailyInsight(transactions, wallets);
            setInsight(data);
        } catch (error) {
            console.error("Failed to load insight:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkChallengeStatus = async () => {
        try {
            const today = new Date().toDateString();
            const challengeData = await AsyncStorage.getItem(CHALLENGE_KEY);
            if (challengeData) {
                const { date, active } = JSON.parse(challengeData);
                setIsChallengeActive(active && date === today);
            }
        } catch (error) {
            console.warn("Failed to check challenge status:", error);
        }
    };

    const handleButtonPress = async () => {
        if (!insight) return;

        switch (insight.theme) {
            case 'danger':
                // Navigate to Analytics with category filter hint
                router.push({
                    pathname: '/analytics',
                    params: { focusCategory: insight.topCategory }
                });
                break;

            case 'success':
                // Accept challenge - save state
                const today = new Date().toDateString();
                await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify({
                    date: today,
                    active: true,
                }));
                setIsChallengeActive(true);
                onChallengeAccepted?.();
                break;

            case 'info':
                // Navigate to profile/settings for budget
                router.push('/profile');
                break;
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    // Don't render if no data or loading
    if (loading) {
        return (
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.loadingContainer}
            >
                <View style={styles.loadingCard}>
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ type: 'timing', duration: 800, loop: true }}
                        style={styles.loadingPulse}
                    />
                </View>
            </MotiView>
        );
    }

    if (!insight || transactions.length === 0) {
        return null;
    }

    const gradientColors = THEME_GRADIENTS[insight.theme];
    const glowColor = THEME_GLOW[insight.theme];

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {/* Glow effect */}
            <View style={[styles.glowEffect, { backgroundColor: glowColor }]} />

            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientContainer}
            >
                {/* Glass overlay */}
                <View style={styles.glassOverlay} />

                {/* Challenge badge */}
                {isChallengeActive && insight.theme === 'success' && (
                    <MotiView
                        from={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', delay: 300 }}
                        style={styles.challengeBadge}
                    >
                        <Ionicons name="flame" size={12} color="#fff" />
                        <Text style={styles.challengeBadgeText}>Challenge Active</Text>
                    </MotiView>
                )}

                <View style={styles.content}>
                    {/* Header with emoji */}
                    <View style={styles.header}>
                        <MotiView
                            from={{ scale: 0, rotate: '-45deg' }}
                            animate={{ scale: 1, rotate: '0deg' }}
                            transition={{ type: 'spring', delay: 200 }}
                            style={styles.emojiContainer}
                        >
                            <Text style={styles.emoji}>{insight.emoji}</Text>
                        </MotiView>

                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{insight.title}</Text>
                        </View>
                    </View>

                    {/* Message */}
                    <MotiView
                        from={{ opacity: 0, translateX: -20 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ type: 'timing', delay: 300, duration: 400 }}
                    >
                        <Text style={styles.message}>{insight.message}</Text>
                    </MotiView>

                    {/* Action Button */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', delay: 400, duration: 300 }}
                    >
                        <Pressable
                            onPress={handleButtonPress}
                            style={({ pressed }) => [
                                styles.button,
                                { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
                            ]}
                        >
                            <BlurView intensity={80} tint="light" style={styles.buttonBlur}>
                                <Text style={styles.buttonText}>{insight.buttonText}</Text>
                                <Ionicons
                                    name={
                                        insight.theme === 'danger' ? 'arrow-forward' :
                                            insight.theme === 'success' ? 'checkmark-circle' : 'settings'
                                    }
                                    size={16}
                                    color="rgba(0,0,0,0.7)"
                                />
                            </BlurView>
                        </Pressable>
                    </MotiView>
                </View>

                {/* Decorative elements */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    glowEffect: {
        position: 'absolute',
        top: 10,
        left: 20,
        right: 20,
        bottom: -10,
        borderRadius: 24,
        opacity: 0.6,
    },
    gradientContainer: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    challengeBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    challengeBadgeText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 10,
        color: '#fff',
    },
    content: {
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    emoji: {
        fontSize: 24,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 22,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    message: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 22,
        marginBottom: 16,
    },
    button: {
        alignSelf: 'flex-start',
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    buttonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.7)',
    },
    decorCircle1: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -20,
        left: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    loadingContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    loadingCard: {
        height: 160,
        borderRadius: 24,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        overflow: 'hidden',
    },
    loadingPulse: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
    },
});
