import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;
const BORDER_RADIUS = 32;

type BottomSheetProps = {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoints?: number[];
    enableBackdropDismiss?: boolean;
    title?: string;
    style?: ViewStyle;
    showBack?: boolean;
    onBack?: () => void;
};

export function BottomSheet({
    isVisible,
    onClose,
    children,
    snapPoints = [0.5, 0.85],
    enableBackdropDismiss = true,
    title,
    style,
    showBack = false,
    onBack,
}: BottomSheetProps) {
    const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const opacity = useSharedValue(0);
    const currentSnapIndex = useSharedValue(0);
    const keyboardHeightSV = useSharedValue(0);

    const snapPointsHeights = snapPoints.map((point) => -SCREEN_HEIGHT * point);
    const defaultHeight = snapPointsHeights[0];

    const [modalVisible, setModalVisible] = React.useState(false);

    useEffect(() => {
        if (isVisible) {
            setModalVisible(true);
            translateY.value = withSpring(defaultHeight, {
                damping: 50,
                stiffness: 400,
            });
            opacity.value = withTiming(1, { duration: 300 });
            currentSnapIndex.value = 0;
        } else {
            translateY.value = withSpring(0, { damping: 50, stiffness: 400 });
            opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setModalVisible)(false);
                }
            });
        }
    }, [isVisible, defaultHeight]);

    const scrollTo = (destination: number) => {
        'worklet';
        translateY.value = withSpring(destination, { damping: 50, stiffness: 400 });
    };

    useEffect(() => {
        keyboardHeightSV.value = keyboardHeight;

        if (isVisible) {
            const currentSnapHeight = snapPointsHeights[currentSnapIndex.value];
            let destination: number;

            if (isKeyboardVisible) {
                destination = currentSnapHeight - keyboardHeight;
            } else {
                destination = currentSnapHeight;
            }
            scrollTo(destination);
        }
    }, [keyboardHeight, isKeyboardVisible, isVisible]);

    const findClosestSnapPoint = (currentY: number) => {
        'worklet';
        const adjustedY = currentY + keyboardHeightSV.value;

        let closest = snapPointsHeights[0];
        let minDistance = Math.abs(adjustedY - closest);
        let closestIndex = 0;

        for (let i = 0; i < snapPointsHeights.length; i++) {
            const snapPoint = snapPointsHeights[i];
            const distance = Math.abs(adjustedY - snapPoint);
            if (distance < minDistance) {
                minDistance = distance;
                closest = snapPoint;
                closestIndex = i;
            }
        }
        currentSnapIndex.value = closestIndex;
        return closest;
    };

    const handlePress = () => {
        const nextIndex = (currentSnapIndex.value + 1) % snapPointsHeights.length;
        currentSnapIndex.value = nextIndex;
        const destination = snapPointsHeights[nextIndex] - keyboardHeightSV.value;
        scrollTo(destination);
    };

    const animateClose = () => {
        'worklet';
        translateY.value = withSpring(0, { damping: 50, stiffness: 400 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
                runOnJS(onClose)();
            }
        });
    };

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            const newY = context.value.y + event.translationY;
            if (newY <= 0 && newY >= MAX_TRANSLATE_Y) {
                translateY.value = newY;
            }
        })
        .onEnd((event) => {
            const currentY = translateY.value;
            const velocity = event.velocityY;

            if (velocity > 500 && currentY > -SCREEN_HEIGHT * 0.2) {
                animateClose();
                return;
            }

            const closestSnapPoint = findClosestSnapPoint(currentY);
            const finalDestination = closestSnapPoint - keyboardHeightSV.value;
            scrollTo(finalDestination);
        });

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const rBackdropStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const handleBackdropPress = () => {
        if (enableBackdropDismiss) {
            animateClose();
        }
    };

    return (
        <Modal
            visible={modalVisible}
            transparent
            statusBarTranslucent
            animationType='none'
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View
                    style={[
                        { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
                        rBackdropStyle,
                    ]}
                >
                    <TouchableWithoutFeedback onPress={handleBackdropPress}>
                        <Animated.View style={{ flex: 1 }} />
                    </TouchableWithoutFeedback>

                    <GestureDetector gesture={gesture}>
                        <Animated.View
                            style={[
                                styles.sheetContainer,
                                rBottomSheetStyle,
                                style,
                            ]}
                        >
                            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                                <View style={styles.glassOverlay} />
                            </BlurView>

                            {/* Handle */}
                            <TouchableWithoutFeedback onPress={handlePress}>
                                <View style={styles.handleContainer}>
                                    <View style={styles.handle} />
                                </View>
                            </TouchableWithoutFeedback>

                            {/* Header with Back Button */}
                            {(title || showBack) && (
                                <View style={styles.header}>
                                    {showBack && (
                                        <TouchableWithoutFeedback onPress={onBack}>
                                            <View style={styles.backButton}>
                                                <Text style={styles.backText}>← Back</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    )}
                                    {title && (
                                        <Text style={[styles.title, showBack && { flex: 1, textAlign: 'center', marginRight: 50 }]}>
                                            {title}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Content */}
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                                keyboardShouldPersistTaps='handled'
                                showsVerticalScrollIndicator={false}
                            >
                                {children}
                            </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
}

// Hook for managing bottom sheet state
export function useBottomSheet() {
    const [isVisible, setIsVisible] = React.useState(false);

    const open = React.useCallback(() => {
        setIsVisible(true);
    }, []);

    const close = React.useCallback(() => {
        setIsVisible(false);
    }, []);

    const toggle = React.useCallback(() => {
        setIsVisible((prev) => !prev);
    }, []);

    return {
        isVisible,
        open,
        close,
        toggle,
    };
}

const styles = StyleSheet.create({
    sheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        position: 'absolute',
        top: SCREEN_HEIGHT,
        borderTopLeftRadius: BORDER_RADIUS,
        borderTopRightRadius: BORDER_RADIUS,
        overflow: 'hidden',
        shadowColor: "#A855F7",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 50,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20, 20, 40, 0.95)',
    },
    handleContainer: {
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
    },
    handle: {
        width: 48,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        paddingVertical: 8,
        paddingRight: 16,
    },
    backText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: '#A855F7',
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 22,
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
});
