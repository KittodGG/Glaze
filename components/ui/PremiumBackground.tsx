import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Orb = ({ color, size, startPos, delay = 0 }: { color: string, size: number, startPos: { x: number, y: number }, delay?: number }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(delay, withRepeat(
            withTiming(Math.random() * 100 - 50, { duration: 5000 + Math.random() * 5000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        ));
        translateY.value = withDelay(delay, withRepeat(
            withTiming(Math.random() * 100 - 50, { duration: 5000 + Math.random() * 5000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    left: startPos.x,
                    top: startPos.y,
                    opacity: 0.85,
                    filter: 'blur(60px)', // Web specific, but on native we rely on the component above or overlay blur
                },
                animatedStyle,
            ]}
        >
            {/* On native, we can simulate blur with a gradient or just rely on the overlap */}
            <LinearGradient
                colors={[color, 'transparent']}
                style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
            />
        </Animated.View>
    );
};

export function PremiumBackground({ children }: { children?: React.ReactNode }) {
    // Enhanced dark background
    const backgroundColor = '#050511'; // Very deep blue/black

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {/* Mesh Orbs */}
            <Orb color="#4c1d95" size={width * 1.2} startPos={{ x: -width * 0.4, y: -width * 0.2 }} />
            <Orb color="#312e81" size={width * 1} startPos={{ x: width * 0.4, y: height * 0.6 }} delay={1000} />
            <Orb color="#be185d" size={width * 0.8} startPos={{ x: -width * 0.2, y: height * 0.3 }} delay={2000} />

            {/* Overlay to smooth everything out */}
            <View style={StyleSheet.absoluteFillObject}>
                <LinearGradient
                    colors={['rgba(5,5,17,0.2)', 'rgba(5,5,17,0.5)']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
    },
});
