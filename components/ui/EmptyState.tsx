import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title?: string;
    message?: string;
}

export function EmptyState({
    icon = 'wallet-outline',
    title = 'No transactions yet',
    message = 'Tap + to start tracking your spending',
}: EmptyStateProps) {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.container}
        >
            <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
                <View style={styles.glassOverlay}>
                    <MotiView
                        from={{ rotate: '-10deg', scale: 0.8 }}
                        animate={{ rotate: '0deg', scale: 1 }}
                        transition={{ type: 'spring', delay: 200 }}
                    >
                        <View style={styles.iconWrapper}>
                            <Ionicons name={icon} size={48} color="rgba(168, 85, 247, 0.8)" />
                        </View>
                    </MotiView>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {/* Decorative glow */}
                    <View style={styles.glow} />
                </View>
            </BlurView>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 24,
        marginHorizontal: 24,
    },
    blurContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    glassOverlay: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 30, 50, 0.6)',
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 20,
    },
    glow: {
        position: 'absolute',
        top: -50,
        left: '50%',
        marginLeft: -75,
        width: 150,
        height: 150,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderRadius: 75,
        opacity: 0.5,
    },
});
