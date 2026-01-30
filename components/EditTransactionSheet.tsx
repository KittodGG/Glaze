import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useEditSheet } from '@/context/EditSheetContext';
import { getCategoryIcon, useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const CATEGORIES = [
    'Food', 'Drink', 'Transport', 'Shopping', 'Entertainment',
    'Bills', 'Health', 'Education', 'Subscription', 'Other'
];

export function EditTransactionSheet() {
    const { isOpen, transaction, closeSheet } = useEditSheet();
    const updateTransaction = useTransactionStore((s) => s.updateTransaction);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && transaction) {
            setTitle(transaction.title);
            setAmount(transaction.amount.toString());
            setCategory(transaction.category);
        }
    }, [isOpen, transaction]);

    const handleClose = () => {
        setTitle('');
        setAmount('');
        setCategory('');
        setSaving(false);
        closeSheet();
    };

    const handleSave = async () => {
        if (!transaction) return;

        const parsedAmount = parseFloat(amount.replace(/[^\d]/g, ''));
        if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid title and amount');
            return;
        }

        setSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            await updateTransaction(transaction.id, {
                title: title.trim(),
                amount: parsedAmount,
                category,
                icon: getCategoryIcon(category),
            }, true);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to update transaction');
        } finally {
            setSaving(false);
        }
    };

    return (
        <BottomSheet
            isVisible={isOpen}
            onClose={handleClose}
            title="Edit Transaction"
            snapPoints={[0.6]}
        >
            {/* Title Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Item Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g., Kopi Kenangan"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                </View>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.currencyPrefix}>Rp</Text>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="25000"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* Category Picker */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => {
                                setCategory(cat);
                                Haptics.selectionAsync();
                            }}
                            style={[
                                styles.categoryChip,
                                category === cat && styles.categoryChipActive,
                            ]}
                        >
                            <Ionicons
                                name={getCategoryIcon(cat) as any}
                                size={16}
                                color={category === cat ? '#fff' : 'rgba(255,255,255,0.6)'}
                            />
                            <Text
                                style={[
                                    styles.categoryText,
                                    category === cat && styles.categoryTextActive,
                                ]}
                            >
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Save Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.saveButton,
                    { opacity: pressed || saving ? 0.8 : 1 },
                ]}
                onPress={handleSave}
                disabled={saving}
            >
                <LinearGradient
                    colors={['#A855F7', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </LinearGradient>
            </Pressable>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        marginBottom: 8,
        color: 'rgba(255,255,255,0.7)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
    },
    currencyPrefix: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: 'rgba(255,255,255,0.6)',
        marginRight: 8,
    },
    input: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_400Regular',
        paddingVertical: 14,
        color: '#FFFFFF',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryChipActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
        borderColor: 'rgba(168, 85, 247, 0.5)',
    },
    categoryText: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_500Medium',
        color: 'rgba(255,255,255,0.6)',
    },
    categoryTextActive: {
        color: '#fff',
    },
    saveButton: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 16,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
});
