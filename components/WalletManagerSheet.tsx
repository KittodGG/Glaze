import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Wallet } from '@/services/walletService';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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

const WALLET_ICONS = ['💳', '💰', '🏦', '💵', '💎', '🪙', '📱', '💸'];

const WALLET_COLORS: [string, string][] = [
    ['#005C97', '#363795'],
    ['#00B4DB', '#0083B0'],
    ['#8E2DE2', '#4A00E0'],
    ['#11998e', '#38ef7d'],
    ['#F2994A', '#F2C94C'],
    ['#EB5757', '#F2994A'],
    ['#2D3436', '#636E72'],
    ['#6C63FF', '#3F3D56'],
];

interface WalletManagerSheetProps {
    visible: boolean;
    onClose: () => void;
}

export function WalletManagerSheet({ visible, onClose }: WalletManagerSheetProps) {
    const wallets = useWalletStore((s) => s.wallets);
    const addWallet = useWalletStore((s) => s.addWallet);
    const updateWallet = useWalletStore((s) => s.updateWallet);
    const deleteWallet = useWalletStore((s) => s.deleteWallet);

    const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('💳');
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);

    const resetForm = () => {
        setName('');
        setBalance('');
        setSelectedIcon('💳');
        setSelectedColorIndex(0);
        setEditingWallet(null);
    };

    const handleClose = () => {
        setMode('list');
        resetForm();
        onClose();
    };

    const handleAddNew = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        resetForm();
        setMode('add');
    };

    const handleEdit = (wallet: Wallet) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEditingWallet(wallet);
        setName(wallet.name);
        setBalance(wallet.balance.toString());
        setSelectedIcon(wallet.icon || '💳');
        const colorIdx = WALLET_COLORS.findIndex(
            c => c[0] === wallet.colors[0] && c[1] === wallet.colors[1]
        );
        setSelectedColorIndex(colorIdx >= 0 ? colorIdx : 0);
        setMode('edit');
    };

    const handleDelete = (wallet: Wallet) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            'Hapus Wallet',
            `Yakin mau hapus "${wallet.name}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: () => {
                        deleteWallet(wallet.id!);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
            ]
        );
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Nama wallet harus diisi');
            return;
        }

        const balanceNum = parseInt(balance.replace(/\D/g, '')) || 0;

        if (mode === 'add') {
            const newWallet: Wallet = {
                id: `wallet-${Date.now()}`,
                name: name.trim(),
                balance: balanceNum,
                colors: WALLET_COLORS[selectedColorIndex],
                icon: selectedIcon,
                userId: 'local'
            };
            addWallet(newWallet);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (mode === 'edit' && editingWallet) {
            updateWallet(editingWallet.id!, {
                name: name.trim(),
                balance: balanceNum,
                colors: WALLET_COLORS[selectedColorIndex],
                icon: selectedIcon
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setMode('list');
        resetForm();
    };

    const formatBalance = (text: string) => {
        const num = text.replace(/\D/g, '');
        if (!num) return '';
        return parseInt(num).toLocaleString('id-ID');
    };

    const getTitle = () => {
        if (mode === 'list') return 'Manage Wallets';
        if (mode === 'add') return 'Add Wallet';
        return 'Edit Wallet';
    };

    const handleBack = () => {
        setMode('list');
        resetForm();
    };

    return (
        <BottomSheet
            isVisible={visible}
            onClose={handleClose}
            title={getTitle()}
            snapPoints={[0.8]}
            showBack={mode !== 'list'}
            onBack={handleBack}
        >
            {mode === 'list' ? (
                /* LIST VIEW */
                <View style={styles.content}>
                    {wallets.map((wallet, index) => (
                        <MotiView
                            key={wallet.id}
                            from={{ opacity: 0, translateX: -20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ delay: index * 50 }}
                        >
                            <Pressable
                                onPress={() => handleEdit(wallet)}
                                onLongPress={() => handleDelete(wallet)}
                                style={({ pressed }) => [
                                    styles.walletItem,
                                    { opacity: pressed ? 0.8 : 1 }
                                ]}
                            >
                                <LinearGradient
                                    colors={wallet.colors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.walletGradient}
                                >
                                    <View style={styles.walletInfo}>
                                        <Text style={styles.walletIcon}>{wallet.icon || '💳'}</Text>
                                        <View>
                                            <Text style={styles.walletName}>{wallet.name}</Text>
                                            <Text style={styles.walletBalance}>
                                                Rp {wallet.balance.toLocaleString('id-ID')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                                </LinearGradient>
                            </Pressable>
                        </MotiView>
                    ))}

                    <Pressable
                        onPress={handleAddNew}
                        style={({ pressed }) => [
                            styles.addButton,
                            { opacity: pressed ? 0.8 : 1 }
                        ]}
                    >
                        <Ionicons name="add-circle" size={24} color="#A855F7" />
                        <Text style={styles.addButtonText}>Tambah Wallet Baru</Text>
                    </Pressable>

                    <Text style={styles.hint}>Tap untuk edit • Tekan lama untuk hapus</Text>
                </View>
            ) : (
                /* ADD/EDIT FORM */
                <View style={styles.content}>
                    {/* Wallet Preview */}
                    <LinearGradient
                        colors={WALLET_COLORS[selectedColorIndex]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.previewCard}
                    >
                        <Text style={styles.previewIcon}>{selectedIcon}</Text>
                        <Text style={styles.previewName}>{name || 'Nama Wallet'}</Text>
                        <Text style={styles.previewBalance}>Rp {formatBalance(balance) || '0'}</Text>
                    </LinearGradient>

                    {/* Name Input */}
                    <Text style={styles.label}>Nama Wallet</Text>
                    <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="contoh: BCA, GoPay, Cash..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            style={styles.input}
                        />
                    </BlurView>

                    {/* Balance Input */}
                    <Text style={styles.label}>Saldo Awal</Text>
                    <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                        <Text style={styles.currencyPrefix}>Rp</Text>
                        <TextInput
                            value={formatBalance(balance)}
                            onChangeText={(t) => setBalance(t.replace(/\D/g, ''))}
                            placeholder="0"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            keyboardType="numeric"
                            style={[styles.input, styles.balanceInput]}
                        />
                    </BlurView>

                    {/* Icon Picker */}
                    <Text style={styles.label}>Icon</Text>
                    <View style={styles.iconPicker}>
                        {WALLET_ICONS.map((icon) => (
                            <Pressable
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                style={[
                                    styles.iconOption,
                                    selectedIcon === icon && styles.iconOptionSelected
                                ]}
                            >
                                <Text style={styles.iconOptionText}>{icon}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Color Picker */}
                    <Text style={styles.label}>Warna</Text>
                    <View style={styles.colorPicker}>
                        {WALLET_COLORS.map((clrs, index) => (
                            <Pressable
                                key={index}
                                onPress={() => setSelectedColorIndex(index)}
                                style={[
                                    styles.colorOption,
                                    selectedColorIndex === index && styles.colorOptionSelected
                                ]}
                            >
                                <LinearGradient colors={clrs} style={styles.colorGradient} />
                            </Pressable>
                        ))}
                    </View>

                    {/* Save Button */}
                    <Pressable
                        onPress={handleSave}
                        style={({ pressed }) => [
                            styles.saveButton,
                            { opacity: pressed ? 0.9 : 1 }
                        ]}
                    >
                        <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.saveGradient}>
                            <Text style={styles.saveText}>
                                {mode === 'add' ? 'Tambah Wallet' : 'Simpan Perubahan'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            )}
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    walletItem: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    walletGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    walletInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    walletIcon: {
        fontSize: 28,
    },
    walletName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#fff',
    },
    walletBalance: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
        borderWidth: 2,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    addButtonText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 15,
        color: '#FFFFFF',
    },
    hint: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 40,
        color: 'rgba(255,255,255,0.5)',
    },
    previewCard: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    previewIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    previewName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
        color: '#fff',
    },
    previewBalance: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    label: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        marginBottom: 8,
        color: 'rgba(255,255,255,0.7)',
    },
    inputBlur: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
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
    balanceInput: {
        paddingLeft: 8,
    },
    iconPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    iconOptionSelected: {
        borderWidth: 2,
        borderColor: '#A855F7',
    },
    iconOptionText: {
        fontSize: 24,
    },
    colorPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    colorGradient: {
        flex: 1,
    },
    saveButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 40,
    },
    saveGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#fff',
    },
});
