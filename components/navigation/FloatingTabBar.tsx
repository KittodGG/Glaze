import { Colors } from '@/constants/Colors';
import { useMagicSheet } from '@/context/MagicSheetContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
    const { bottom } = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { openSheet } = useMagicSheet();
    const isAndroid = Platform.OS === 'android';

    const tabs = [
        { name: 'index', icon: 'home' },
        { name: 'analytics', icon: 'bar-chart' },
        { name: 'chat', icon: 'chatbubbles' },
        { name: 'profile', icon: 'person' },
    ];

    const handlePlusPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        openSheet();
    };

    return (
        <View style={[styles.container, { bottom: Math.max(bottom, 16) + 12 }]}>
            {/* Tab bar background */}
            <View style={styles.tabBarWrapper}>
                {isAndroid ? (
                    <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
                ) : (
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                )}

                {/* Tab items container */}
                <View style={styles.tabRow}>
                    {/* First 2 tabs */}
                    {tabs.slice(0, 2).map((tab) => {
                        const isFocused = state.index === state.routes.findIndex(r => r.name === tab.name);
                        return (
                            <TabButton
                                key={tab.name}
                                icon={tab.icon}
                                isFocused={isFocused}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    if (!isFocused) navigation.navigate(tab.name);
                                }}
                            />
                        );
                    })}

                    {/* Spacer for + button */}
                    <View style={styles.centerSpacer} />

                    {/* Last 2 tabs */}
                    {tabs.slice(2, 4).map((tab) => {
                        const isFocused = state.index === state.routes.findIndex(r => r.name === tab.name);
                        return (
                            <TabButton
                                key={tab.name}
                                icon={tab.icon}
                                isFocused={isFocused}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    if (!isFocused) navigation.navigate(tab.name);
                                }}
                            />
                        );
                    })}
                </View>
            </View>

            {/* Floating + button */}
            <Pressable
                onPress={handlePlusPress}
                style={({ pressed }) => [
                    styles.plusButton,
                    { transform: [{ scale: pressed ? 0.92 : 1 }] }
                ]}
            >
                <LinearGradient
                    colors={['#A855F7', '#7C3AED', '#6366F1']}
                    style={styles.plusGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </LinearGradient>
            </Pressable>
        </View>
    );
}

function TabButton({ icon, isFocused, onPress }: { icon: string; isFocused: boolean; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={styles.tabButton}>
            <MotiView
                animate={{
                    scale: isFocused ? 1.15 : 1,
                    translateY: isFocused ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Ionicons
                    name={isFocused ? icon as any : `${icon}-outline` as any}
                    size={24}
                    color={isFocused ? '#A855F7' : 'rgba(255,255,255,0.5)'}
                />
            </MotiView>
            {isFocused && <View style={styles.indicator} />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 100,
    },
    tabBarWrapper: {
        width: '100%',
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    androidBg: {
        backgroundColor: 'rgba(15, 15, 30, 0.95)',
    },
    tabRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    centerSpacer: {
        width: 64, // Space for the + button
    },
    indicator: {
        position: 'absolute',
        bottom: 8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#A855F7',
    },
    plusButton: {
        position: 'absolute',
        top: -20, // Float above the bar
        alignSelf: 'center',
        shadowColor: "#A855F7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
    },
    plusGradient: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
