import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

interface HomeHeaderProps {
    showChallengeBadge?: boolean;
}

export function HomeHeader({ showChallengeBadge = false }: HomeHeaderProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.greetingRow}>
                    <Text style={[styles.greeting, { color: '#fff' }]}>Welcome!</Text>
                    {showChallengeBadge && (
                        <MotiView
                            from={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring' }}
                            style={styles.challengeBadge}
                        >
                            <Ionicons name="flame" size={14} color="#fff" />
                        </MotiView>
                    )}
                </View>
                <Text style={[styles.subtext, { color: 'rgba(255,255,255,0.7)' }]}>
                    {showChallengeBadge ? '🔥 Challenge Active!' : 'Financial Health: 85%'}
                </Text>
            </View>
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={['#A855F7', '#7C3AED']}
                    style={styles.avatar}
                >
                    <Ionicons name="person" size={24} color="#fff" />
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
        marginTop: 10,
    },
    leftSection: {
        flex: 1,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    greeting: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 28,
    },
    challengeBadge: {
        backgroundColor: '#F97316',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    subtext: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        marginTop: 4,
    },
    avatarContainer: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
