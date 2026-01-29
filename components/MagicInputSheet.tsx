import { Colors } from '@/constants/Colors';
import { useMagicSheet } from '@/context/MagicSheetContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseTransactionInput } from '@/services/gemini';
import { getCategoryIcon, useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.50; // 50% of screen for better bottom clearance

export function MagicInputSheet() {
    const { isOpen, closeSheet } = useMagicSheet();
    const addTransaction = useTransactionStore((s) => s.addTransaction);
    const translateY = useSharedValue(SCREEN_HEIGHT); // Start off-screen
    const { bottom } = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            // Slide up to show sheet
            translateY.value = withSpring(SCREEN_HEIGHT - SHEET_HEIGHT, {
                damping: 20,
                stiffness: 200,
            });
        } else {
            // Slide down off screen
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
                runOnJS(resetState)();
            });
            Keyboard.dismiss();
        }
    }, [isOpen]);

    const resetState = () => {
        setInput('');
        setLoading(false);
        setResult(null);
    };

    const handleProcess = async () => {
        if (!input.trim()) return;

        console.log('[MagicInput] Processing input:', input);

        setLoading(true);
        try {
            console.log('[MagicInput] Calling Gemini API...');
            const data = await parseTransactionInput(input);
            console.log('[MagicInput] Gemini response:', data);
            setResult(data);
        } catch (e) {
            console.error('[MagicInput] Gemini Error:', e);
            Alert.alert('Error', 'Failed to process transaction');
        } finally {
            setLoading(false);
        }
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow dragging down
            if (event.translationY > 0) {
                translateY.value = (SCREEN_HEIGHT - SHEET_HEIGHT) + event.translationY;
            }
        })
        .onEnd((event) => {
            // If dragged more than 1/3 of sheet height or fast velocity, close
            if (event.translationY > SHEET_HEIGHT / 3 || event.velocityY > 500) {
                runOnJS(closeSheet)();
            } else {
                // Snap back to open position
                translateY.value = withSpring(SCREEN_HEIGHT - SHEET_HEIGHT, {
                    damping: 20,
                    stiffness: 200,
                });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Don't render if not open (optimization)
    if (!isOpen && translateY.value >= SCREEN_HEIGHT) {
        return null;
    }

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <MotiView
                        from={{ opacity: 0.5, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1.1 }}
                        transition={{ type: 'timing', duration: 800, loop: true }}
                    >
                        <Ionicons name="sparkles" size={48} color="#A855F7" />
                    </MotiView>
                    <Text style={styles.loadingText}>Magic Processing...</Text>
                </View>
            );
        }

        if (result) {
            return (
                <View style={styles.resultContainer}>
                    <View style={styles.resultItem}>
                        <Text style={styles.label}>Item</Text>
                        <Text style={styles.value}>{result.item}</Text>
                    </View>
                    <View style={styles.resultItem}>
                        <Text style={styles.label}>Amount</Text>
                        <Text style={styles.value}>Rp {result.amount?.toLocaleString?.() || result.amount}</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <View style={styles.resultItem}>
                            <Text style={styles.label}>Category</Text>
                            <View style={[styles.tag, { backgroundColor: 'rgba(168, 85, 247, 0.3)' }]}>
                                <Text style={{ color: '#A855F7', fontWeight: 'bold' }}>{result.category}</Text>
                            </View>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.label}>Wallet</Text>
                            <View style={[styles.tag, { backgroundColor: 'rgba(59, 130, 246, 0.3)' }]}>
                                <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>{result.source_wallet}</Text>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        style={styles.saveButton}
                        onPress={() => {
                            // Create transaction object
                            const transaction = {
                                id: `temp_${Date.now()}`, // Firebase will replace with real ID
                                title: result.item_name,
                                amount: result.amount,
                                category: result.category,
                                source_wallet: result.source_wallet,
                                date: new Date().toISOString(),
                                icon: getCategoryIcon(result.category),
                            };

                            // Save to store (syncs to Firebase)
                            addTransaction(transaction, true);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            Alert.alert('Saved!', 'Transaction added successfully');
                            closeSheet();
                        }}
                    >
                        <LinearGradient
                            colors={['#A855F7', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.saveButtonText}>Confirm & Save</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            );
        }

        return (
            <>
                <Text style={styles.title}>Quick Add Transaction</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ngopi 25rb pake gopay..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        multiline
                        autoFocus
                        value={input}
                        onChangeText={setInput}
                    />
                </View>
                <Pressable
                    style={({ pressed }) => [
                        styles.processButton,
                        { opacity: pressed ? 0.8 : 1 }
                    ]}
                    onPress={handleProcess}
                >
                    <LinearGradient
                        colors={['#A855F7', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                    >
                        <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Magic Process</Text>
                    </LinearGradient>
                </Pressable>
            </>
        );
    };

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.sheetContainer, animatedStyle]}>
                {/* Glass background */}
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                    <View style={styles.glassOverlay} />
                </BlurView>

                {/* Content */}
                <View style={[styles.content, { paddingBottom: Math.max(bottom, 20) + 30 }]}>
                    {/* Drag handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.dragHandle} />
                    </View>
                    {renderContent()}
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    sheetContainer: {
        position: 'absolute',
        width: '100%',
        height: SHEET_HEIGHT,
        left: 0,
        right: 0,
        zIndex: 9999,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        shadowColor: "#A855F7",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 50,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20, 20, 40, 0.92)',
    },
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 12,
    },
    handleContainer: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 8,
    },
    dragHandle: {
        width: 48,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 3,
    },
    title: {
        fontSize: 24,
        fontFamily: 'PlusJakartaSans_700Bold',
        marginBottom: 24,
        color: '#FFFFFF',
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 24,
    },
    input: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_400Regular',
        padding: 16,
        minHeight: 100,
        color: '#FFFFFF',
    },
    processButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#FFFFFF',
    },
    resultContainer: {
        gap: 16,
    },
    resultItem: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_400Regular',
        marginBottom: 4,
        color: 'rgba(255,255,255,0.6)',
    },
    value: {
        fontSize: 24,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#FFFFFF',
    },
    resultRow: {
        flexDirection: 'row',
        gap: 24,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    saveButton: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 16,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
});
