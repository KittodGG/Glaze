import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useEditSheet } from '@/context/EditSheetContext';
import { getCategoriesByType, getCategoryIcon, useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export function EditTransactionSheet() {
    const { isOpen, transaction, closeSheet } = useEditSheet();
    const updateTransaction = useTransactionStore((s) => s.updateTransaction);
    const wallets = useWalletStore((s) => s.wallets);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [walletId, setWalletId] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const categories = useMemo(() => getCategoriesByType(type), [type]);

    useEffect(() => {
        if (isOpen && transaction) {
            setTitle(transaction.title);
            setAmount(transaction.amount.toString());
            setCategory(transaction.category);
            setType(transaction.type || 'expense');
            setWalletId(transaction.source_wallet);
            setDate(new Date(transaction.date));
        }
    }, [isOpen, transaction]);

    const handleClose = () => {
        setTitle('');
        setAmount('');
        setCategory('');
        setType('expense');
        setWalletId('');
        setDate(new Date());
        setSaving(false);
        closeSheet();
    };

    const formatAmount = (text: string) => {
        const num = text.replace(/[^\d]/g, '');
        if (!num) return '';
        return parseInt(num).toLocaleString('id-ID');
    };

    const handleSave = async () => {
        if (!transaction) return;

        const parsedAmount = parseFloat(amount.replace(/[^\d]/g, ''));
        if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            await updateTransaction(transaction.id, {
                title: title.trim(),
                amount: parsedAmount,
                category,
                type,
                source_wallet: walletId,
                date: date.toISOString(),
                icon: getCategoryIcon(category),
            }, true);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleClose();
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setSaving(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const newDate = new Date(date);
            newDate.setFullYear(selectedDate.getFullYear());
            newDate.setMonth(selectedDate.getMonth());
            newDate.setDate(selectedDate.getDate());
            setDate(newDate);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const newDate = new Date(date);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setDate(newDate);
        }
    };

    const selectedWallet = wallets.find(w => w.id === walletId);

    return (
        <BottomSheet
            isVisible={isOpen}
            onClose={handleClose}
            title="Edit Transaction"
            snapPoints={[0.85]}
        >
            {/* Type Toggle */}
            <View style={styles.typeToggle}>
                <Pressable
                    onPress={() => { setType('expense'); setCategory(''); Haptics.selectionAsync(); }}
                    style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
                >
                    <Ionicons name="arrow-down-circle" size={20} color={type === 'expense' ? '#fff' : '#EF4444'} />
                    <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                        Expense
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => { setType('income'); setCategory(''); Haptics.selectionAsync(); }}
                    style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
                >
                    <Ionicons name="arrow-up-circle" size={20} color={type === 'income' ? '#fff' : '#22C55E'} />
                    <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                        Income
                    </Text>
                </Pressable>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.5)" />
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
                        style={[styles.input, styles.amountInput]}
                        value={formatAmount(amount)}
                        onChangeText={(t) => setAmount(t.replace(/[^\d]/g, ''))}
                        placeholder="25,000"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* Date & Time Row */}
            <View style={styles.dateTimeRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Date</Text>
                    <Pressable
                        onPress={() => setShowDatePicker(true)}
                        style={styles.dateButton}
                    >
                        <Ionicons name="calendar-outline" size={20} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.dateText}>
                            {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </Pressable>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Time</Text>
                    <Pressable
                        onPress={() => setShowTimePicker(true)}
                        style={styles.dateButton}
                    >
                        <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.dateText}>
                            {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Wallet Picker */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Wallet</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
                    {wallets.map((wallet) => (
                        <Pressable
                            key={wallet.id}
                            onPress={() => { setWalletId(wallet.id!); Haptics.selectionAsync(); }}
                            style={[styles.walletChip, walletId === wallet.id && styles.walletChipActive]}
                        >
                            <Text style={styles.walletIcon}>{wallet.icon || '💳'}</Text>
                            <Text style={[styles.walletName, walletId === wallet.id && styles.walletNameActive]}>
                                {wallet.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Category Picker */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <Pressable
                            key={cat.name}
                            onPress={() => { setCategory(cat.name); Haptics.selectionAsync(); }}
                            style={[styles.categoryChip, category === cat.name && styles.categoryChipActive]}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={16}
                                color={category === cat.name ? '#fff' : 'rgba(255,255,255,0.6)'}
                            />
                            <Text style={[styles.categoryText, category === cat.name && styles.categoryTextActive]}>
                                {cat.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Save Button */}
            <Pressable
                style={({ pressed }) => [styles.saveButton, { opacity: pressed || saving ? 0.8 : 1 }]}
                onPress={handleSave}
                disabled={saving}
            >
                <LinearGradient
                    colors={type === 'income' ? ['#22C55E', '#16A34A'] : ['#A855F7', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                >
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </LinearGradient>
            </Pressable>

            {/* Date/Time Pickers */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    themeVariant="dark"
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    themeVariant="dark"
                />
            )}
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    typeToggle: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
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
        color: 'rgba(255,255,255,0.6)',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        marginBottom: 8,
        color: 'rgba(255,255,255,0.7)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 14,
        gap: 10,
    },
    currencyPrefix: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: 'rgba(255,255,255,0.6)',
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_400Regular',
        paddingVertical: 14,
        color: '#FFFFFF',
    },
    amountInput: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    dateText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: '#fff',
    },
    walletScroll: {
        marginHorizontal: -4,
    },
    walletChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4,
    },
    walletChipActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: '#A855F7',
    },
    walletIcon: {
        fontSize: 18,
    },
    walletName: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    walletNameActive: {
        color: '#fff',
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
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryChipActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.25)',
        borderColor: 'rgba(168, 85, 247, 0.5)',
    },
    categoryText: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_500Medium',
        color: 'rgba(255,255,255,0.6)',
    },
    categoryTextActive: {
        color: '#fff',
    },
    saveButton: {
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 20,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 17,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
});
