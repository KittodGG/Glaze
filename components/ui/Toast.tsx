import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_COLORS: Record<ToastType, { bg: string; icon: string; iconName: keyof typeof Ionicons.glyphMap }> = {
    success: { bg: 'rgba(34, 197, 94, 0.15)', icon: '#22C55E', iconName: 'checkmark-circle' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', icon: '#EF4444', iconName: 'close-circle' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', icon: '#F59E0B', iconName: 'warning' },
    info: { bg: 'rgba(168, 85, 247, 0.15)', icon: '#A855F7', iconName: 'information-circle' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const { top } = useSafeAreaInsets();
    const [toast, setToast] = useState<ToastConfig | null>(null);
    const [visible, setVisible] = useState(false);

    const showToast = useCallback((config: ToastConfig) => {
        setToast(config);
        setVisible(true);

        // Haptic feedback based on type
        if (config.type === 'success') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (config.type === 'error') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Auto dismiss
        setTimeout(() => {
            setVisible(false);
        }, config.duration || 3000);
    }, []);

    const dismissToast = () => setVisible(false);

    const colors = toast ? TOAST_COLORS[toast.type] : TOAST_COLORS.info;

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && toast && (
                <MotiView
                    from={{ opacity: 0, translateY: -50, scale: 0.9 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    exit={{ opacity: 0, translateY: -50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 15 }}
                    style={[styles.container, { top: top + 10 }]}
                >
                    <Pressable onPress={dismissToast}>
                        <BlurView intensity={80} tint="dark" style={styles.blur}>
                            <View style={[styles.content, { backgroundColor: colors.bg }]}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
                                    <Ionicons name={colors.iconName} size={24} color={colors.icon} />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{toast.title}</Text>
                                    {toast.message && (
                                        <Text style={styles.message}>{toast.message}</Text>
                                    )}
                                </View>
                                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
                            </View>
                        </BlurView>
                    </Pressable>
                </MotiView>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
    },
    blur: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 15,
        color: '#FFFFFF',
    },
    message: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
});
