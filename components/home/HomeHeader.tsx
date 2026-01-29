import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image, StyleSheet, Text, View } from 'react-native';

export function HomeHeader() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <View>
                <Text style={[styles.greeting, { color: '#fff' }]}>Hi, Antigravity</Text>
                <Text style={[styles.subtext, { color: 'rgba(255,255,255,0.7)' }]}>Financial Health: 85%</Text>
            </View>
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                    style={styles.avatar}
                />
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
    greeting: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 28,
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
    },
});
