import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useMagicSheet } from '@/context/MagicSheetContext';
import { parseTransactionInput } from '@/services/gemini';
import { getCategoryIcon, useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

export function MagicInputSheet() {
    const { isOpen, closeSheet } = useMagicSheet();
    const addTransaction = useTransactionStore((s) => s.addTransaction);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const resetState = () => {
        setInput('');
        setLoading(false);
        setResult(null);
    };

    const handleClose = () => {
        resetState();
        closeSheet();
    };

    const handleProcess = async () => {
        if (!input.trim()) return;

        setLoading(true);
        try {
            const data = await parseTransactionInput(input);
            setResult(data);
        } catch (e) {
            console.error('[MagicInput] Error:', e);
            Alert.alert('Error', 'Failed to process transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!result) return;

        const transaction = {
            id: `temp_${Date.now()}`,
            title: result.item,
            amount: result.amount,
            category: result.category,
            source_wallet: result.source_wallet,
            date: new Date().toISOString(),
            icon: getCategoryIcon(result.category),
            type: result.type || 'expense' as 'income' | 'expense',
        };

        addTransaction(transaction, true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Saved!', 'Transaction added successfully');
        handleClose();
    };

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

                    <Pressable style={styles.saveButton} onPress={handleSave}>
                        <LinearGradient
                            colors={['#A855F7', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.saveButtonText}>Confirm & Save</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable
                        style={styles.retryButton}
                        onPress={() => setResult(null)}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <View style={styles.inputContent}>
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
            </View>
        );
    };

    return (
        <BottomSheet
            isVisible={isOpen}
            onClose={handleClose}
            snapPoints={[0.55]}
        >
            {renderContent()}
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    inputContent: {
        flex: 1,
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
        paddingVertical: 60,
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
    retryButton: {
        alignItems: 'center',
        padding: 12,
    },
    retryText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
});
