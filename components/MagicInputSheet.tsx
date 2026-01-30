import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useMagicSheet } from '@/context/MagicSheetContext';
import { parseTransactionInput } from '@/services/gemini';
import { getCategoryIcon, useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

const CATEGORIES = [
    { name: 'Food', icon: 'fast-food' },
    { name: 'Drink', icon: 'cafe' },
    { name: 'Transport', icon: 'car' },
    { name: 'Shopping', icon: 'cart' },
    { name: 'Entertainment', icon: 'game-controller' },
    { name: 'Bills', icon: 'receipt' },
    { name: 'Health', icon: 'medkit' },
    { name: 'Salary', icon: 'cash' },
    { name: 'Gift', icon: 'gift' },
    { name: 'Other', icon: 'pricetag' },
];

interface ParsedResult {
    item: string;
    amount: number;
    category: string;
    source_wallet: string;
    type?: 'income' | 'expense';
}

export function MagicInputSheet() {
    const { isOpen, closeSheet } = useMagicSheet();
    const addTransaction = useTransactionStore((s) => s.addTransaction);
    const wallets = useWalletStore((s) => s.wallets);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ParsedResult | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Editable fields
    const [editTitle, setEditTitle] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editWallet, setEditWallet] = useState('');
    const [editType, setEditType] = useState<'income' | 'expense'>('expense');

    const resetState = () => {
        setInput('');
        setLoading(false);
        setResult(null);
        setIsEditing(false);
        setEditTitle('');
        setEditAmount('');
        setEditCategory('');
        setEditWallet('');
        setEditType('expense');
    };

    const handleClose = () => {
        resetState();
        closeSheet();
    };

    const handleProcess = async () => {
        if (!input.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true);
        
        try {
            const data = await parseTransactionInput(input);
            setResult(data);
            
            // Pre-fill edit fields
            setEditTitle(data.item || '');
            setEditAmount(data.amount?.toString() || '');
            setEditCategory(data.category || 'Other');
            setEditWallet(data.source_wallet || (wallets.length > 0 ? wallets[0].name : 'Cash'));
            setEditType(data.type || 'expense');
        } catch (e) {
            console.error('[MagicInput] Error:', e);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        const amount = parseInt(editAmount.replace(/\D/g, '')) || 0;
        if (!editTitle.trim() || amount <= 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        const transaction = {
            id: `temp_${Date.now()}`,
            title: editTitle.trim(),
            amount: amount,
            category: editCategory,
            source_wallet: editWallet,
            date: new Date().toISOString(),
            icon: getCategoryIcon(editCategory),
            type: editType,
        };

        addTransaction(transaction, true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        handleClose();
    };

    const formatAmount = (text: string) => {
        const num = text.replace(/\D/g, '');
        if (!num) return '';
        return parseInt(num).toLocaleString('id-ID');
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
                    <Text style={styles.loadingSubtext}>Analyzing your input with AI</Text>
                </View>
            );
        }

        if (result) {
            return (
                <View style={styles.resultContainer}>
                    <View style={styles.resultHeader}>
                        <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                        <Text style={styles.resultHeaderText}>AI Generated Result</Text>
                        <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.editToggle}>
                            <Ionicons name={isEditing ? "close" : "create"} size={18} color="#A855F7" />
                            <Text style={styles.editToggleText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                        </Pressable>
                    </View>

                    {/* Type Toggle */}
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.typeToggle}>
                        <Pressable
                            style={[styles.typeButton, editType === 'expense' && styles.typeButtonActiveExpense]}
                            onPress={() => setEditType('expense')}
                        >
                            <Ionicons name="arrow-down" size={18} color={editType === 'expense' ? '#fff' : 'rgba(255,255,255,0.5)'} />
                            <Text style={[styles.typeButtonText, editType === 'expense' && styles.typeButtonTextActive]}>Expense</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.typeButton, editType === 'income' && styles.typeButtonActiveIncome]}
                            onPress={() => setEditType('income')}
                        >
                            <Ionicons name="arrow-up" size={18} color={editType === 'income' ? '#fff' : 'rgba(255,255,255,0.5)'} />
                            <Text style={[styles.typeButtonText, editType === 'income' && styles.typeButtonTextActive]}>Income</Text>
                        </Pressable>
                    </View>

                    {/* Title */}
                    <Text style={styles.label}>Item</Text>
                    {isEditing ? (
                        <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                            <TextInput
                                value={editTitle}
                                onChangeText={setEditTitle}
                                style={styles.editInput}
                                placeholderTextColor="rgba(255,255,255,0.4)"
                            />
                        </BlurView>
                    ) : (
                        <Text style={styles.resultValue}>{editTitle}</Text>
                    )}

                    {/* Amount */}
                    <Text style={styles.label}>Amount</Text>
                    {isEditing ? (
                        <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                            <Text style={styles.currencyPrefix}>Rp</Text>
                            <TextInput
                                value={formatAmount(editAmount)}
                                onChangeText={(t) => setEditAmount(t.replace(/\D/g, ''))}
                                style={[styles.editInput, { paddingLeft: 0 }]}
                                keyboardType="numeric"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                            />
                        </BlurView>
                    ) : (
                        <Text style={styles.resultValue}>Rp {parseInt(editAmount || '0').toLocaleString('id-ID')}</Text>
                    )}

                    {/* Category & Wallet */}
                    <View style={styles.resultRow}>
                        <View style={styles.resultItem}>
                            <Text style={styles.label}>Category</Text>
                            {isEditing ? (
                                <View style={styles.chipGrid}>
                                    {CATEGORIES.slice(0, 6).map((cat) => (
                                        <Pressable
                                            key={cat.name}
                                            onPress={() => setEditCategory(cat.name)}
                                            style={[styles.chip, editCategory === cat.name && styles.chipActive]}
                                        >
                                            <Ionicons name={cat.icon as any} size={14} color={editCategory === cat.name ? '#A855F7' : 'rgba(255,255,255,0.6)'} />
                                            <Text style={[styles.chipText, editCategory === cat.name && styles.chipTextActive]}>{cat.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : (
                                <View style={[styles.tag, { backgroundColor: 'rgba(168, 85, 247, 0.3)' }]}>
                                    <Text style={{ color: '#A855F7', fontWeight: 'bold' }}>{editCategory}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Wallet */}
                    <Text style={styles.label}>Wallet</Text>
                    {isEditing ? (
                        <View style={styles.chipGrid}>
                            {wallets.map((w) => (
                                <Pressable
                                    key={w.id}
                                    onPress={() => setEditWallet(w.name)}
                                    style={[styles.chip, editWallet === w.name && styles.chipActiveBlue]}
                                >
                                    <Text style={styles.chipIcon}>{w.icon}</Text>
                                    <Text style={[styles.chipText, editWallet === w.name && styles.chipTextActiveBlue]}>{w.name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View style={[styles.tag, { backgroundColor: 'rgba(59, 130, 246, 0.3)' }]}>
                            <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>{editWallet}</Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <Pressable style={styles.saveButton} onPress={handleSave}>
                        <LinearGradient
                            colors={editType === 'income' ? ['#22C55E', '#16A34A'] : ['#A855F7', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Confirm & Save</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable style={styles.retryButton} onPress={() => { setResult(null); setInput(''); }}>
                        <Text style={styles.retryText}>↻ Try Different Input</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <View style={styles.inputContent}>
                <View style={styles.titleRow}>
                    <LinearGradient colors={['#A855F7', '#6366F1']} style={styles.titleIcon}>
                        <Ionicons name="sparkles" size={20} color="#fff" />
                    </LinearGradient>
                    <View>
                        <Text style={styles.title}>Quick Add Transaction</Text>
                        <Text style={styles.subtitle}>Powered by AI ✨</Text>
                    </View>
                </View>

                <Text style={styles.hint}>
                    Type naturally! Examples: {'\n'}
                    • "Ngopi 25rb pake gopay" {'\n'}
                    • "Gaji bulan ini 5jt ke BCA" {'\n'}
                    • "Makan siang 35000 cash"
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe your transaction..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        multiline
                        autoFocus
                        value={input}
                        onChangeText={setInput}
                    />
                </View>

                <Pressable
                    style={({ pressed }) => [styles.processButton, { opacity: input.trim() ? (pressed ? 0.8 : 1) : 0.5 }]}
                    onPress={handleProcess}
                    disabled={!input.trim()}
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
            snapPoints={[0.75]}
        >
            {renderContent()}
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    inputContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 16,
    },
    titleIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: 'rgba(255,255,255,0.6)',
    },
    hint: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 20,
        marginBottom: 20,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        padding: 14,
        borderRadius: 12,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },
    input: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_400Regular',
        padding: 16,
        minHeight: 100,
        color: '#FFFFFF',
        textAlignVertical: 'top',
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
    loadingSubtext: {
        marginTop: 4,
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: 'rgba(255,255,255,0.5)',
    },
    resultContainer: {
        gap: 8,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        padding: 12,
        borderRadius: 12,
    },
    resultHeaderText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#22C55E',
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    editToggleText: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#A855F7',
    },
    label: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        marginBottom: 6,
        marginTop: 12,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    resultValue: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#FFFFFF',
    },
    resultItem: {
        flex: 1,
    },
    resultRow: {
        flexDirection: 'row',
        gap: 16,
    },
    tag: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    typeToggle: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    typeButtonActiveExpense: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: '#EF4444',
    },
    typeButtonActiveIncome: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: '#22C55E',
    },
    typeButtonText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    typeButtonTextActive: {
        color: '#FFFFFF',
    },
    inputBlur: {
        borderRadius: 12,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    editInput: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 16,
        padding: 12,
        color: '#FFFFFF',
    },
    currencyPrefix: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
        paddingLeft: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderColor: '#A855F7',
    },
    chipActiveBlue: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3B82F6',
    },
    chipIcon: {
        fontSize: 16,
    },
    chipText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    chipTextActive: {
        color: '#A855F7',
    },
    chipTextActiveBlue: {
        color: '#3B82F6',
    },
    saveButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 24,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    retryButton: {
        alignItems: 'center',
        padding: 14,
    },
    retryText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
});
