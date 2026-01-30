import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon = 'wallet-outline',
    title = 'No transactions yet',
    message = 'Start tracking your spending to see insights here',
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.container}
        >
            {/* Animated Icon */}
            <MotiView
                from={{ scale: 0.5, rotate: '-15deg' }}
                animate={{ scale: 1, rotate: '0deg' }}
                transition={{ type: 'spring', delay: 100 }}
                style={styles.iconContainer}
            >
                <LinearGradient
                    colors={['rgba(168, 85, 247, 0.2)', 'rgba(99, 102, 241, 0.15)']}
                    style={styles.iconGradient}
                >
                    <Ionicons name={icon} size={40} color="#A855F7" />
                </LinearGradient>
            </MotiView>

            {/* Text Content */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {/* Action Button */}
            {actionLabel && onAction && (
                <Pressable
                    onPress={onAction}
                    style={({ pressed }) => [
                        styles.actionButton,
                        { opacity: pressed ? 0.8 : 1 }
                    ]}
                >
                    <LinearGradient
                        colors={['#A855F7', '#7C3AED']}
                        style={styles.actionGradient}
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={styles.actionText}>{actionLabel}</Text>
                    </LinearGradient>
                </Pressable>
            )}

            {/* Decorative Elements */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
        position: 'relative',
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 250,
    },
    actionButton: {
        marginTop: 20,
        borderRadius: 14,
        overflow: 'hidden',
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    actionText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: '#fff',
    },
    decorCircle1: {
        position: 'absolute',
        top: 20,
        right: 30,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
    },
});
