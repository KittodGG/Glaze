import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView, BlurViewProps } from 'expo-blur';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface GlassViewProps extends BlurViewProps {
    containerStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export function GlassView({ containerStyle, style, intensity = 40, children, ...props }: GlassViewProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isAndroid = Platform.OS === 'android';

    return (
        <View style={[
            styles.container,
            {
                // Premium glass borders
                borderColor: 'rgba(255,255,255,0.2)', // Always subtle white border
                backgroundColor: colorScheme === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(20,20,30,0.3)'
            },
            containerStyle
        ]}>
            {isAndroid ? (
                // Android fallback or implementation
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: colorScheme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(15,15,25,0.85)'
                        }
                    ]}
                />
            ) : (
                <BlurView
                    intensity={intensity}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={[StyleSheet.absoluteFill]}
                    {...props}
                />
            )}
            <View style={[style, { zIndex: 1 }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 24,
        borderWidth: 0.5, // Thin border
        // Subtle outer glow/shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
});
