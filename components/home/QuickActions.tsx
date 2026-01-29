import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface QuickAction {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    bgColor: string;
}

export function QuickActions() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();

    const [showIncomeSheet, setShowIncomeSheet] = useState(false);
    const [showExpenseSheet, setShowExpenseSheet] = useState(false);

    const actions: (QuickAction & { action: () => void })[] = [
        {
            icon: 'add-circle',
            label: 'Income',
            color: '#22C55E',
            bgColor: 'rgba(34, 197, 94, 0.15)',
            action: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowIncomeSheet(true);
            }
        },
        {
            icon: 'remove-circle',
            label: 'Expense',
            color: '#EF4444',
            bgColor: 'rgba(239, 68, 68, 0.15)',
            action: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowExpenseSheet(true);
            }
        },
        {
            icon: 'chatbubbles',
            label: 'Magic AI',
            color: '#A855F7',
            bgColor: 'rgba(168, 85, 247, 0.15)',
            action: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/chat');
            }
        },
        {
            icon: 'list',
            label: 'All Trans.',
            color: '#3B82F6',
            bgColor: 'rgba(59, 130, 246, 0.15)',
            action: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/profile'); // Profile page shows transaction history
            }
        },
    ];

    return (
        <>
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: 100 }}
                style={styles.container}
            >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {actions.map((action, index) => (
                        <Pressable
                            key={index}
                            onPress={action.action}
                            style={({ pressed }) => [
                                styles.actionButton,
                                { opacity: pressed ? 0.8 : 1 }
                            ]}
                        >
                            <BlurView
                                intensity={40}
                                tint={colorScheme}
                                style={styles.actionBlur}
                            >
                                <LinearGradient
                                    colors={[action.bgColor, 'transparent']}
                                    style={styles.actionGradient}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: action.bgColor }]}>
                                        <Ionicons name={action.icon} size={24} color={action.color} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: colors.text }]}>
                                        {action.label}
                                    </Text>
                                </LinearGradient>
                            </BlurView>
                        </Pressable>
                    ))}
                </View>
            </MotiView>

            {/* Manual Transaction Sheets */}
            <AddTransactionSheet
                visible={showIncomeSheet}
                onClose={() => setShowIncomeSheet(false)}
                type="income"
            />
            <AddTransactionSheet
                visible={showExpenseSheet}
                onClose={() => setShowExpenseSheet(false)}
                type="expense"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 18,
        marginBottom: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        width: '47%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionBlur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    actionGradient: {
        padding: 16,
        alignItems: 'center',
        gap: 10,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
    },
});
