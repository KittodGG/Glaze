import { Transaction, useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { GlassView } from '@/components/ui/GlassView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_THRESHOLD = -80;
const SNAP_POINT = -70;

interface SwipeableTransactionProps {
    item: Transaction;
    onPress: (item: Transaction) => void;
}

export function SwipeableTransaction({ item, onPress }: SwipeableTransactionProps) {
    const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(75);
    const opacity = useSharedValue(1);

    const triggerHaptic = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, []);

    const handleDelete = useCallback(() => {
        Alert.alert(
            'Delete Transaction',
            `Are you sure you want to delete "${item.title}"?`,
            [
                {
                    text: 'Cancel', style: 'cancel', onPress: () => {
                        translateX.value = withSpring(0);
                    }
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // Animate out then delete
                        opacity.value = withTiming(0, { duration: 200 });
                        itemHeight.value = withTiming(0, { duration: 300 }, () => {
                            runOnJS(deleteTransaction)(item.id, true);
                        });
                    },
                },
            ]
        );
    }, [item.id, item.title, deleteTransaction]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            // Only allow swiping left
            if (event.translationX < 0) {
                translateX.value = Math.max(event.translationX, -100);
            }
        })
        .onEnd((event) => {
            if (event.translationX < DELETE_THRESHOLD) {
                // Show delete action
                translateX.value = withSpring(SNAP_POINT);
                runOnJS(triggerHaptic)();
                runOnJS(handleDelete)();
            } else {
                // Snap back
                translateX.value = withSpring(0);
            }
        });

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            if (translateX.value === 0) {
                runOnJS(onPress)(item);
            } else {
                translateX.value = withSpring(0);
            }
        });

    const composedGesture = Gesture.Race(panGesture, tapGesture);

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const animatedContainerStyle = useAnimatedStyle(() => ({
        height: itemHeight.value,
        opacity: opacity.value,
        marginBottom: itemHeight.value > 0 ? 12 : 0,
    }));

    const animatedDeleteStyle = useAnimatedStyle(() => ({
        opacity: translateX.value < -20 ? 1 : 0,
        transform: [{ scale: translateX.value < -40 ? 1 : 0.8 }],
    }));

    return (
        <Animated.View style={animatedContainerStyle}>
            {/* Delete action background */}
            <Animated.View style={[styles.deleteAction, animatedDeleteStyle]}>
                <View style={styles.deleteIconWrapper}>
                    <Ionicons name="trash" size={24} color="#fff" />
                </View>
            </Animated.View>

            {/* Swipeable card */}
            <GestureDetector gesture={composedGesture}>
                <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
                    <GlassView style={styles.item} intensity={60} containerStyle={styles.itemContainer}>
                        <View style={styles.left}>
                            <View style={styles.iconBox}>
                                <Ionicons name={(item.icon || 'pricetag') as any} size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.date}>
                                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.amount}>-Rp {item.amount.toLocaleString()}</Text>
                    </GlassView>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    deleteAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 12,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#EF4444',
    },
    deleteIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWrapper: {
        flex: 1,
    },
    itemContainer: {
        borderRadius: 20,
    },
    item: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#fff',
    },
    date: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    amount: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#fff',
    },
});
