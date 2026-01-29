import { WalletManagerSheet } from '@/components/WalletManagerSheet';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MENU_ITEMS = [
    { icon: 'person-outline', label: 'Account Settings', description: 'Manage your profile' },
    { icon: 'notifications-outline', label: 'Notifications', description: 'Alerts & reminders' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', description: 'Password & 2FA' },
    { icon: 'card-outline', label: 'Payment Methods', description: 'Manage wallets' },
    { icon: 'help-circle-outline', label: 'Help Center', description: 'FAQs & support' },
];

export default function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { top } = useSafeAreaInsets();
    const isAndroid = Platform.OS === 'android';

    // Get real data from stores
    const wallets = useWalletStore((s) => s.wallets);
    const transactions = useTransactionStore((s) => s.transactions);

    // Wallet manager sheet state
    const [walletManagerVisible, setWalletManagerVisible] = useState(false);

    // Compute stats from real data
    const totalBalance = useMemo(
        () => wallets.reduce((sum, w) => sum + w.balance, 0),
        [wallets]
    );
    const transactionCount = transactions.length;

    // Format total balance for display
    const formatBalance = (amount: number) => {
        if (amount >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `Rp ${(amount / 1000).toFixed(0)}k`;
        }
        return `Rp ${amount}`;
    };

    const handleLogout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            'Logout',
            'Yakin mau keluar dari akun?',
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{ paddingTop: top, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with gradient background */}
                <LinearGradient
                    colors={['#7C3AED', '#A855F7', colors.background]}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <Pressable style={styles.settingsButton}>
                            <Ionicons name="settings-outline" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Avatar with glow */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'timing', duration: 400 }}
                        style={styles.avatarContainer}
                    >
                        <View style={styles.avatarGlow} />
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/200?img=12' }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        <Pressable style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={14} color="#fff" />
                        </Pressable>
                    </MotiView>

                    <Text style={styles.userName}>Antigravity</Text>
                    <Text style={styles.userEmail}>antigravity@glaze.app</Text>

                    {/* Premium badge */}
                    <View style={styles.premiumBadge}>
                        <Ionicons name="diamond" size={14} color="#F59E0B" />
                        <Text style={styles.premiumText}>Premium Member</Text>
                    </View>
                </LinearGradient>

                {/* Stats Row */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 100 }}
                    style={styles.statsContainer}
                >
                    {[
                        { value: formatBalance(totalBalance), label: 'Total Saved', icon: 'wallet' },
                        { value: transactionCount.toString(), label: 'Transactions', icon: 'receipt' },
                        { value: '🔥', label: 'Day Streak', icon: 'flame' },
                    ].map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: colors.card }]}>
                                <Ionicons name={stat.icon as any} size={20} color="#A855F7" />
                            </View>
                            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>{stat.label}</Text>
                        </View>
                    ))}
                </MotiView>

                {/* Connected Wallets */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 150 }}
                    style={[styles.section, { marginTop: 20 }]}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Wallets</Text>
                        <Pressable onPress={() => setWalletManagerVisible(true)}>
                            <Text style={styles.sectionAction}>Manage</Text>
                        </Pressable>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
                        {wallets.map((wallet, index) => (
                            <Pressable
                                key={wallet.id}
                                onPress={() => setWalletManagerVisible(true)}
                            >
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ type: 'timing', duration: 300 }}
                                    style={[
                                        styles.walletCard,
                                        { backgroundColor: colors.card },
                                    ]}
                                >
                                    <Text style={styles.walletIcon}>{wallet.icon || '💳'}</Text>
                                    <Text style={[styles.walletName, { color: colors.text }]}>{wallet.name}</Text>
                                    <Text style={[styles.walletBalance, { color: colors.icon }]}>
                                        Rp {wallet.balance.toLocaleString('id-ID')}
                                    </Text>
                                </MotiView>
                            </Pressable>
                        ))}
                    </ScrollView>
                </MotiView>

                {/* Menu Items */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 200 }}
                    style={styles.section}
                >
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Settings</Text>

                    {MENU_ITEMS.map((item, index) => (
                        <Pressable
                            key={index}
                            style={({ pressed }) => [
                                styles.menuItem,
                                { backgroundColor: pressed ? colors.card : 'transparent' }
                            ]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: colors.card }]}>
                                <Ionicons name={item.icon as any} size={22} color="#A855F7" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                                <Text style={[styles.menuDescription, { color: colors.icon }]}>{item.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                        </Pressable>
                    ))}
                </MotiView>

                {/* Logout Button */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 500 }}
                    style={styles.logoutContainer}
                >
                    <Pressable
                        onPress={handleLogout}
                        style={({ pressed }) => [
                            styles.logoutButton,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>

                    <Text style={[styles.version, { color: colors.icon }]}>Glaze v1.0.0</Text>
                </MotiView>
            </ScrollView>

            {/* Wallet Manager Sheet */}
            <WalletManagerSheet
                visible={walletManagerVisible}
                onClose={() => setWalletManagerVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 28,
        color: '#fff',
    },
    settingsButton: {
        padding: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        top: -5,
        left: -5,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#A855F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#7C3AED',
    },
    userName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 26,
        color: '#fff',
    },
    userEmail: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 12,
        gap: 6,
    },
    premiumText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 12,
        color: '#F59E0B',
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: -20,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderRadius: 20,
        padding: 20,
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
    },
    statLabel: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
    },
    sectionAction: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: '#A855F7',
    },
    walletScroll: {
        marginLeft: -20,
        paddingLeft: 20,
    },
    walletCard: {
        width: 120,
        padding: 16,
        borderRadius: 16,
        marginRight: 12,
        alignItems: 'center',
    },
    walletCardDisabled: {
        opacity: 0.5,
    },
    walletIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    walletName: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
    },
    walletBalance: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 11,
        marginTop: 4,
    },
    walletConnect: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 11,
        color: '#A855F7',
        marginTop: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderRadius: 12,
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
    },
    menuDescription: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        marginTop: 2,
    },
    logoutContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    logoutText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
        color: '#EF4444',
    },
    version: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
        marginTop: 8,
    },
});
