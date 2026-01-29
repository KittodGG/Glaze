import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCategoryIcon, useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORIES = [
    { name: 'Food', icon: 'fast-food' },
    { name: 'Drink', icon: 'cafe' },
    { name: 'Transport', icon: 'car' },
    { name: 'Shopping', icon: 'cart' },
    { name: 'Entertainment', icon: 'game-controller' },
    { name: 'Bills', icon: 'receipt' },
    { name: 'Health', icon: 'medkit' },
    { name: 'Education', icon: 'school' },
    { name: 'Subscription', icon: 'film' },
    { name: 'Other', icon: 'pricetag' },
];

const INCOME_CATEGORIES = [
    { name: 'Salary', icon: 'briefcase' },
    { name: 'Freelance', icon: 'laptop' },
    { name: 'Investment', icon: 'trending-up' },
    { name: 'Gift', icon: 'gift' },
    { name: 'Bonus', icon: 'star' },
    { name: 'Other', icon: 'cash' },
];

const WALLETS = ['Cash', 'BCA', 'GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja'];

interface AddTransactionSheetProps {
    visible: boolean;
    onClose: () => void;
    type: 'income' | 'expense';
}

export function AddTransactionSheet({ visible, onClose, type }: AddTransactionSheetProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { bottom } = useSafeAreaInsets();
    const addTransaction = useTransactionStore((s) => s.addTransaction);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [wallet, setWallet] = useState('Cash');

    const isIncome = type === 'income';
    const accentColor = isIncome ? '#22C55E' : '#EF4444';
    const categories = isIncome ? INCOME_CATEGORIES : CATEGORIES;

    const handleSave = () => {
        if (!title.trim() || !amount || !category) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
        if (isNaN(numAmount) || numAmount <= 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        addTransaction({
            id: `manual-${Date.now()}`,
            title: title.trim(),
            amount: numAmount,
            category,
            source_wallet: wallet,
            date: new Date().toISOString(),
            icon: getCategoryIcon(category),
            type,
        });

        // Reset and close
        setTitle('');
        setAmount('');
        setCategory('');
        setWallet('Cash');
        onClose();
    };

    const handleClose = () => {
        setTitle('');
        setAmount('');
        setCategory('');
        setWallet('Cash');
        onClose();
    };

    const formatAmount = (text: string) => {
        const num = text.replace(/[^0-9]/g, '');
        if (!num) return '';
        return new Intl.NumberFormat('id-ID').format(parseInt(num));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardView}
                    >
                        <Pressable style={styles.backdrop} onPress={handleClose} />

                        <MotiView
                            from={{ translateY: SCREEN_HEIGHT }}
                            animate={{ translateY: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                            style={styles.sheetContainer}
                        >
                            <BlurView
                                intensity={80}
                                tint={colorScheme}
                                style={[styles.sheet, { paddingBottom: bottom + 20 }]}
                            >
                                {/* Handle */}
                                <View style={styles.handleContainer}>
                                    <View style={[styles.handle, { backgroundColor: colors.icon }]} />
                                </View>

                                {/* Header */}
                                <View style={styles.header}>
                                    <LinearGradient
                                        colors={isIncome ? ['#22C55E', '#16A34A'] : ['#EF4444', '#DC2626']}
                                        style={styles.headerIcon}
                                    >
                                        <Ionicons
                                            name={isIncome ? 'arrow-down' : 'arrow-up'}
                                            size={24}
                                            color="#fff"
                                        />
                                    </LinearGradient>
                                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                                        {isIncome ? 'Add Income' : 'Add Expense'}
                                    </Text>
                                    <Pressable onPress={handleClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color={colors.icon} />
                                    </Pressable>
                                </View>

                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.content}
                                >
                                    {/* Title Input */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.icon }]}>Title</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                backgroundColor: colors.card,
                                                color: colors.text
                                            }]}
                                            placeholder={isIncome ? "e.g., Salary January" : "e.g., Lunch"}
                                            placeholderTextColor={colors.icon}
                                            value={title}
                                            onChangeText={setTitle}
                                        />
                                    </View>

                                    {/* Amount Input */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.icon }]}>Amount</Text>
                                        <View style={[styles.amountInput, { backgroundColor: colors.card }]}>
                                            <Text style={[styles.currency, { color: accentColor }]}>Rp</Text>
                                            <TextInput
                                                style={[styles.amountTextInput, { color: colors.text }]}
                                                placeholder="0"
                                                placeholderTextColor={colors.icon}
                                                value={amount}
                                                onChangeText={(t) => setAmount(formatAmount(t))}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    {/* Category Picker */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.icon }]}>Category</Text>
                                        <View style={styles.categoriesGrid}>
                                            {categories.map((cat) => (
                                                <Pressable
                                                    key={cat.name}
                                                    onPress={() => {
                                                        Haptics.selectionAsync();
                                                        setCategory(cat.name);
                                                    }}
                                                    style={[
                                                        styles.categoryChip,
                                                        {
                                                            backgroundColor: category === cat.name
                                                                ? accentColor
                                                                : colors.card,
                                                        }
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name={cat.icon as any}
                                                        size={16}
                                                        color={category === cat.name ? '#fff' : colors.icon}
                                                    />
                                                    <Text style={[
                                                        styles.categoryText,
                                                        {
                                                            color: category === cat.name ? '#fff' : colors.text
                                                        }
                                                    ]}>
                                                        {cat.name}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Wallet Picker */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.icon }]}>Wallet</Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.walletsRow}
                                        >
                                            {WALLETS.map((w) => (
                                                <Pressable
                                                    key={w}
                                                    onPress={() => {
                                                        Haptics.selectionAsync();
                                                        setWallet(w);
                                                    }}
                                                    style={[
                                                        styles.walletChip,
                                                        {
                                                            backgroundColor: wallet === w
                                                                ? accentColor
                                                                : colors.card,
                                                        }
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.walletText,
                                                        { color: wallet === w ? '#fff' : colors.text }
                                                    ]}>
                                                        {w}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </ScrollView>

                                {/* Save Button */}
                                <Pressable
                                    onPress={handleSave}
                                    style={({ pressed }) => [
                                        styles.saveButton,
                                        { opacity: pressed ? 0.9 : 1 }
                                    ]}
                                >
                                    <LinearGradient
                                        colors={isIncome ? ['#22C55E', '#16A34A'] : ['#EF4444', '#DC2626']}
                                        style={styles.saveGradient}
                                    >
                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                        <Text style={styles.saveText}>
                                            Save {isIncome ? 'Income' : 'Expense'}
                                        </Text>
                                    </LinearGradient>
                                </Pressable>
                            </BlurView>
                        </MotiView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    sheetContainer: {
        maxHeight: SCREEN_HEIGHT * 0.85,
    },
    sheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 12,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
    },
    closeButton: {
        padding: 8,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        marginBottom: 10,
    },
    textInput: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 16,
        padding: 16,
        borderRadius: 14,
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 8,
    },
    currency: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
    },
    amountTextInput: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 28,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    categoryText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 13,
    },
    walletsRow: {
        gap: 10,
    },
    walletChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    walletText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
    },
    saveButton: {
        marginHorizontal: 20,
        marginTop: 10,
    },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    saveText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#fff',
    },
});
