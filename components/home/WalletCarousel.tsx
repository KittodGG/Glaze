import { useWalletStore } from '@/store/walletStore';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SPACING = 24;

export function WalletCarousel() {
    const wallets = useWalletStore((s) => s.wallets);

    // Format balance to Rupiah
    const formatBalance = (balance: number) => {
        return `Rp ${balance.toLocaleString('id-ID')}`;
    };

    return (
        <View style={styles.container}>
            <FlashList
                data={wallets}
                renderItem={({ item }) => (
                    <View style={[styles.cardContainer, { width: CARD_WIDTH, marginRight: SPACING }]}>
                        {/* Direct LinearGradient as the card - NO GlassView wrapper */}
                        <LinearGradient
                            colors={item.colors}
                            style={styles.card}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {/* Gloss overlay for glass effect */}
                            <View style={styles.gloss} />

                            <View style={styles.cardHeader}>
                                <Text style={styles.cardName}>{item.name}</Text>
                                <View style={styles.chip} />
                            </View>
                            <Text style={styles.balance}>{formatBalance(item.balance)}</Text>
                            <Text style={styles.number}>{item.accountNumber || '**** **** **** 1234'}</Text>
                        </LinearGradient>
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + SPACING}
                decelerationRate="fast"
                // @ts-ignore
                estimatedItemSize={CARD_WIDTH + SPACING}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                keyExtractor={(item) => item.id || item.name}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    cardContainer: {
        height: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    gloss: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardName: {
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    chip: {
        width: 40,
        height: 28,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    balance: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    number: {
        fontFamily: 'PlusJakartaSans_400Regular',
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
});
