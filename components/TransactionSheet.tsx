import { BottomSheet } from '@/components/ui/bottom-sheet';
import { getCategoryIcon, Transaction, useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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
    { name: 'Other', icon: 'pricetag' },
];

interface TransactionSheetProps {
    visible: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export function TransactionSheet({ visible, onClose, transaction }: TransactionSheetProps) {
    const updateTransaction = useTransactionStore((s) => s.updateTransaction);
    const wallets = useWalletStore((s) => s.wallets);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [selectedWallet, setSelectedWallet] = useState('');
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

    useEffect(() => {
        if (transaction) {
            setTitle(transaction.title);
            setAmount(transaction.amount.toString());
            setCategory(transaction.category || 'Other');
            setSelectedWallet(transaction.source_wallet || '');
            setTransactionType(transaction.type || 'expense');
        }
    }, [transaction]);

    const formatAmount = (text: string) => {
        const num = text.replace(/\D/g, '');
        if (!num) return '';
        return parseInt(num).toLocaleString('id-ID');
    };

    const handleSave = () => {
        if (!transaction) return;

        if (!title.trim()) {
            Alert.alert('Error', 'Title is required');
            return;
        }

        const amountNum = parseInt(amount.replace(/\D/g, '')) || 0;
        if (amountNum <= 0) {
            Alert.alert('Error', 'Amount must be greater than 0');
            return;
        }

        updateTransaction(transaction.id, {
            title: title.trim(),
            amount: amountNum,
            category,
            source_wallet: selectedWallet,
            icon: getCategoryIcon(category),
            type: transactionType,
        }, true);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
    };

    return (
        <BottomSheet
            isVisible={visible}
            onClose={onClose}
            title="Edit Transaction"
            snapPoints={[0.85]}
        >
            {/* Transaction Type Toggle */}
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeToggle}>
                <Pressable
                    style={[
                        styles.typeButton,
                        transactionType === 'expense' && styles.typeButtonActiveExpense
                    ]}
                    onPress={() => setTransactionType('expense')}
                >
                    <Ionicons
                        name="arrow-down"
                        size={18}
                        color={transactionType === 'expense' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                    />
                    <Text style={[
                        styles.typeButtonText,
                        transactionType === 'expense' && styles.typeButtonTextActive
                    ]}>
                        Expense
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.typeButton,
                        transactionType === 'income' && styles.typeButtonActiveIncome
                    ]}
                    onPress={() => setTransactionType('income')}
                >
                    <Ionicons
                        name="arrow-up"
                        size={18}
                        color={transactionType === 'income' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                    />
                    <Text style={[
                        styles.typeButtonText,
                        transactionType === 'income' && styles.typeButtonTextActive
                    ]}>
                        Income
                    </Text>
                </Pressable>
            </View>

            {/* Title Input */}
            <Text style={styles.label}>Title</Text>
            <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Transaction name..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.input}
                />
            </BlurView>

            {/* Amount Input */}
            <Text style={styles.label}>Amount</Text>
            <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                    value={formatAmount(amount)}
                    onChangeText={(t) => setAmount(t.replace(/\D/g, ''))}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="numeric"
                    style={[styles.input, styles.amountInput]}
                />
            </BlurView>

            {/* Category Picker */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                    <Pressable
                        key={cat.name}
                        onPress={() => setCategory(cat.name)}
                        style={[
                            styles.categoryItem,
                            category === cat.name && styles.categoryItemSelected
                        ]}
                    >
                        <Ionicons
                            name={cat.icon as any}
                            size={20}
                            color={category === cat.name ? '#A855F7' : 'rgba(255,255,255,0.6)'}
                        />
                        <Text style={[
                            styles.categoryText,
                            category === cat.name && styles.categoryTextSelected
                        ]}>
                            {cat.name}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Wallet Picker */}
            <Text style={styles.label}>Wallet</Text>
            <View style={styles.walletGrid}>
                {wallets.map((w) => (
                    <Pressable
                        key={w.id}
                        onPress={() => setSelectedWallet(w.name)}
                        style={[
                            styles.walletItem,
                            selectedWallet === w.name && styles.walletItemSelected
                        ]}
                    >
                        <Text style={styles.walletIcon}>{w.icon}</Text>
                        <Text style={[
                            styles.walletText,
                            selectedWallet === w.name && styles.walletTextSelected
                        ]}>
                            {w.name}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Save Button */}
            <Pressable onPress={handleSave} style={styles.saveButton}>
                <LinearGradient
                    colors={['#A855F7', '#7C3AED']}
                    style={styles.saveGradient}
                >
                    <Text style={styles.saveText}>Save Changes</Text>
                </LinearGradient>
            </Pressable>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    label: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 8,
        marginTop: 16,
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
        paddingVertical: 14,
        borderRadius: 14,
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
        borderRadius: 14,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.2)',
    },
    input: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 16,
        padding: 14,
        color: '#FFFFFF',
    },
    currencyPrefix: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
        paddingLeft: 14,
        color: 'rgba(255,255,255,0.6)',
    },
    amountInput: {
        paddingLeft: 8,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryItemSelected: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderColor: '#A855F7',
    },
    categoryText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    categoryTextSelected: {
        color: '#A855F7',
    },
    walletGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    walletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    walletItemSelected: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3B82F6',
    },
    walletIcon: {
        fontSize: 18,
    },
    walletText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    walletTextSelected: {
        color: '#3B82F6',
    },
    saveButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 24,
        marginBottom: 40,
    },
    saveGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#FFFFFF',
    },
});
