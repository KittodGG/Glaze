import { WalletManagerSheet } from '@/components/WalletManagerSheet';
import { useConfirmAlert } from '@/components/ui/CustomAlert';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { top } = useSafeAreaInsets();
    const { confirmDelete, confirmAction, showSuccess } = useConfirmAlert();

    const wallets = useWalletStore((s) => s.wallets);
    const transactions = useTransactionStore((s) => s.transactions);
    const setTransactions = useTransactionStore((s) => s.setTransactions);

    const [walletManagerVisible, setWalletManagerVisible] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    const totalBalance = useMemo(
        () => wallets.reduce((sum, w) => sum + w.balance, 0),
        [wallets]
    );

    const formatBalance = (amount: number) => {
        if (amount >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `Rp ${(amount / 1000).toFixed(0)}k`;
        }
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const handleClearData = () => {
        confirmAction(
            'Hapus Semua Data?',
            'Semua transaksi akan dihapus. Wallet tetap aman. Aksi ini tidak bisa dibatalkan.',
            async () => {
                setTransactions([]);
                await AsyncStorage.removeItem('transaction-storage');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                showSuccess('Berhasil', 'Semua data transaksi telah dihapus');
            }
        );
    };

    const handleExportData = () => {
        const data = {
            transactions,
            wallets,
            exportedAt: new Date().toISOString(),
        };
        console.log('Export data:', JSON.stringify(data, null, 2));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess('Exported!', 'Data telah di-export ke console (dev mode)');
    };

    const handleRateApp = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Open app store
        Linking.openURL('https://play.google.com/store');
    };

    const handleSupport = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Linking.openURL('mailto:support@glaze.app?subject=Glaze Support');
    };

    return (
        <PremiumBackground>
            <ScrollView
                contentContainerStyle={{ paddingTop: top, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Settings</Text>

                    {/* Profile Card */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 300 }}
                    >
                        <LinearGradient
                            colors={['#7C3AED', '#A855F7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.profileCard}
                        >
                            <View style={styles.profileAvatar}>
                                <Ionicons name="person" size={32} color="#A855F7" />
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>Glaze User</Text>
                                <Text style={styles.profileBalance}>{formatBalance(totalBalance)}</Text>
                            </View>
                            <View style={styles.profileStats}>
                                <View style={styles.profileStat}>
                                    <Text style={styles.profileStatValue}>{wallets.length}</Text>
                                    <Text style={styles.profileStatLabel}>Wallets</Text>
                                </View>
                                <View style={styles.profileStatDivider} />
                                <View style={styles.profileStat}>
                                    <Text style={styles.profileStatValue}>{transactions.length}</Text>
                                    <Text style={styles.profileStatLabel}>Trans</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </MotiView>
                </View>

                {/* Wallet Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Wallets</Text>
                    <GlassCard style={styles.card}>
                        <Pressable
                            onPress={() => setWalletManagerVisible(true)}
                            style={({ pressed }) => [
                                styles.menuItem,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                                <Ionicons name="wallet" size={22} color="#22C55E" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>Manage Wallets</Text>
                                <Text style={styles.menuDescription}>{wallets.length} connected wallets</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </Pressable>
                    </GlassCard>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <GlassCard style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                                <Ionicons name="notifications" size={22} color="#A855F7" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>Notifications</Text>
                                <Text style={styles.menuDescription}>Daily reminders</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(168, 85, 247, 0.4)' }}
                                thumbColor={notificationsEnabled ? '#A855F7' : '#666'}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                                <Ionicons name="moon" size={22} color="#6366F1" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>Dark Mode</Text>
                                <Text style={styles.menuDescription}>Always on</Text>
                            </View>
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(99, 102, 241, 0.4)' }}
                                thumbColor={darkMode ? '#6366F1' : '#666'}
                            />
                        </View>
                    </GlassCard>
                </View>

                {/* Data Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <GlassCard style={styles.card}>
                        <Pressable
                            onPress={handleExportData}
                            style={({ pressed }) => [
                                styles.menuItem,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                <Ionicons name="download" size={22} color="#3B82F6" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>Export Data</Text>
                                <Text style={styles.menuDescription}>Backup your transactions</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable
                            onPress={handleClearData}
                            style={({ pressed }) => [
                                styles.menuItem,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                                <Ionicons name="trash" size={22} color="#EF4444" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Clear All Data</Text>
                                <Text style={styles.menuDescription}>Delete all transactions</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </Pressable>
                    </GlassCard>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <GlassCard style={styles.card}>
                        <Pressable
                            onPress={handleRateApp}
                            style={({ pressed }) => [
                                styles.menuItem,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                                <Ionicons name="star" size={22} color="#F59E0B" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>Rate App</Text>
                                <Text style={styles.menuDescription}>Love Glaze? Give us 5 stars!</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable
                            onPress={handleSupport}
                            style={({ pressed }) => [
                                styles.menuItem,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                                <Ionicons name="help-circle" size={22} color="#EC4899" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>Help & Support</Text>
                                <Text style={styles.menuDescription}>Contact us</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </Pressable>
                    </GlassCard>
                </View>

                {/* Version */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Glaze v1.0.0</Text>
                    <Text style={styles.footerSubtext}>Created by Kitna M. F.</Text>
                </View>
            </ScrollView>

            {/* Wallet Manager Sheet */}
            <WalletManagerSheet
                visible={walletManagerVisible}
                onClose={() => setWalletManagerVisible(false)}
            />
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 24,
    },
    headerTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 32,
        color: '#fff',
        marginBottom: 20,
    },
    profileCard: {
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    profileName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#fff',
    },
    profileBalance: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    profileStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    profileStat: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    profileStatValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: '#fff',
    },
    profileStatLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
    },
    profileStatDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        marginHorizontal: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 15,
        color: '#fff',
    },
    menuDescription: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 12,
        marginLeft: 58,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    footerText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
    },
    footerSubtext: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 4,
    },
});
