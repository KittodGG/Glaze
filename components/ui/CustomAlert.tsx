import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type AlertType = 'confirm' | 'danger' | 'success' | 'info';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface AlertConfig {
    type?: AlertType;
    title: string;
    message: string;
    buttons?: AlertButton[];
    icon?: keyof typeof Ionicons.glyphMap;
}

interface AlertContextType {
    showAlert: (config: AlertConfig) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const ALERT_THEMES: Record<AlertType, { gradient: [string, string]; icon: keyof typeof Ionicons.glyphMap }> = {
    confirm: { gradient: ['#A855F7', '#7C3AED'], icon: 'help-circle' },
    danger: { gradient: ['#EF4444', '#DC2626'], icon: 'warning' },
    success: { gradient: ['#22C55E', '#16A34A'], icon: 'checkmark-circle' },
    info: { gradient: ['#3B82F6', '#2563EB'], icon: 'information-circle' },
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [alert, setAlert] = useState<AlertConfig | null>(null);
    const [visible, setVisible] = useState(false);

    const showAlert = useCallback((config: AlertConfig) => {
        setAlert(config);
        setVisible(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
        setTimeout(() => setAlert(null), 300);
    }, []);

    const handleButtonPress = (button: AlertButton) => {
        if (button.style === 'destructive') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        button.onPress?.();
        hideAlert();
    };

    const theme = ALERT_THEMES[alert?.type || 'confirm'];
    const defaultButtons: AlertButton[] = [{ text: 'OK', style: 'default' }];
    const buttons = alert?.buttons || defaultButtons;

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <Modal
                visible={visible}
                transparent
                statusBarTranslucent
                animationType="fade"
            >
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={hideAlert} />
                    
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 15 }}
                        style={styles.alertContainer}
                    >
                        <BlurView intensity={100} tint="dark" style={styles.blur}>
                            <View style={styles.content}>
                                {/* Icon */}
                                <LinearGradient
                                    colors={theme.gradient}
                                    style={styles.iconContainer}
                                >
                                    <Ionicons
                                        name={alert?.icon || theme.icon}
                                        size={32}
                                        color="#fff"
                                    />
                                </LinearGradient>

                                {/* Title & Message */}
                                <Text style={styles.title}>{alert?.title}</Text>
                                <Text style={styles.message}>{alert?.message}</Text>

                                {/* Buttons */}
                                <View style={styles.buttonContainer}>
                                    {buttons.map((button, index) => {
                                        const isDestructive = button.style === 'destructive';
                                        const isCancel = button.style === 'cancel';

                                        return (
                                            <Pressable
                                                key={index}
                                                onPress={() => handleButtonPress(button)}
                                                style={({ pressed }) => [
                                                    styles.button,
                                                    isCancel && styles.cancelButton,
                                                    { opacity: pressed ? 0.8 : 1 }
                                                ]}
                                            >
                                                {isDestructive ? (
                                                    <LinearGradient
                                                        colors={['#EF4444', '#DC2626']}
                                                        style={styles.buttonGradient}
                                                    >
                                                        <Text style={styles.buttonTextWhite}>{button.text}</Text>
                                                    </LinearGradient>
                                                ) : isCancel ? (
                                                    <View style={styles.buttonContent}>
                                                        <Text style={styles.buttonTextCancel}>{button.text}</Text>
                                                    </View>
                                                ) : (
                                                    <LinearGradient
                                                        colors={theme.gradient}
                                                        style={styles.buttonGradient}
                                                    >
                                                        <Text style={styles.buttonTextWhite}>{button.text}</Text>
                                                    </LinearGradient>
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </BlurView>
                    </MotiView>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}

// Helper functions for common alerts
export function useConfirmAlert() {
    const { showAlert } = useAlert();

    return {
        confirmDelete: (itemName: string, onConfirm: () => void) => {
            showAlert({
                type: 'danger',
                title: 'Hapus Item?',
                message: `Yakin mau hapus "${itemName}"? Aksi ini tidak bisa dibatalkan.`,
                icon: 'trash',
                buttons: [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Hapus', style: 'destructive', onPress: onConfirm },
                ],
            });
        },
        confirmAction: (title: string, message: string, onConfirm: () => void) => {
            showAlert({
                type: 'confirm',
                title,
                message,
                buttons: [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Ya', style: 'default', onPress: onConfirm },
                ],
            });
        },
        showSuccess: (title: string, message: string) => {
            showAlert({
                type: 'success',
                title,
                message,
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
        showError: (title: string, message: string) => {
            showAlert({
                type: 'danger',
                title,
                message,
                icon: 'alert-circle',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    };
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    alertContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
    },
    blur: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 30, 50, 0.9)',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    button: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonContent: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonTextWhite: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
    },
    buttonTextCancel: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
    },
});
