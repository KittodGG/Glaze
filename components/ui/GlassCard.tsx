import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    padding?: number;
}

/**
 * A reusable glassmorphic card component with blur, gradient overlay, and border.
 * Matches the styling of BalanceCard and other homepage components.
 */
export function GlassCard({ children, style, intensity = 60, padding = 20 }: GlassCardProps) {
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <View style={[styles.container, style]}>
            <BlurView
                intensity={intensity}
                tint={colorScheme}
                style={styles.blurContainer}
            >
                <LinearGradient
                    colors={colorScheme === 'dark'
                        ? ['rgba(168, 85, 247, 0.15)', 'rgba(99, 102, 241, 0.1)']
                        : ['rgba(168, 85, 247, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradientOverlay, { padding }]}
                >
                    {children}
                </LinearGradient>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    blurContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    gradientOverlay: {
        borderRadius: 24,
    },
});
