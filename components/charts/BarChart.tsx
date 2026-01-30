import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BarChartData {
    label: string;
    value: number;
    color: string;
}

interface BarChartConfig {
    height?: number;
    showLabels?: boolean;
    showValues?: boolean;
    animated?: boolean;
    duration?: number;
    barWidth?: number;
    barRadius?: number;
    gap?: number;
}

interface BarChartProps {
    data: BarChartData[];
    config?: BarChartConfig;
}

export function BarChart({ data, config }: BarChartProps) {
    const {
        height = 180,
        showLabels = true,
        showValues = false,
        animated = true,
        duration = 800,
        barWidth = 32,
        barRadius = 8,
        gap = 8,
    } = config || {};

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <View style={[styles.container, { height }]}>
            <View style={styles.barsContainer}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * (height - 30);

                    return (
                        <View key={item.label} style={[styles.barWrapper, { width: barWidth, marginHorizontal: gap / 2 }]}>
                            {showValues && item.value > 0 && (
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: animated ? (index * 50) + duration : 0 }}
                                >
                                    <Text style={styles.valueText}>
                                        {item.value >= 1000000 
                                            ? `${(item.value / 1000000).toFixed(1)}M`
                                            : item.value >= 1000 
                                                ? `${(item.value / 1000).toFixed(0)}K`
                                                : item.value.toString()
                                        }
                                    </Text>
                                </MotiView>
                            )}
                            
                            <View style={[styles.barBackground, { height: height - 30, borderRadius: barRadius }]}>
                                {animated ? (
                                    <MotiView
                                        from={{ height: 0 }}
                                        animate={{ height: barHeight }}
                                        transition={{ type: 'spring', delay: index * 50, damping: 15 }}
                                        style={[
                                            styles.bar,
                                            {
                                                backgroundColor: item.color,
                                                borderRadius: barRadius,
                                                width: '100%',
                                            }
                                        ]}
                                    />
                                ) : (
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                backgroundColor: item.color,
                                                borderRadius: barRadius,
                                                width: '100%',
                                            }
                                        ]}
                                    />
                                )}
                            </View>

                            {showLabels && (
                                <Text style={styles.label} numberOfLines={1}>
                                    {item.label}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

interface ChartContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function ChartContainer({ title, description, children }: ChartContainerProps) {
    return (
        <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>{title}</Text>
                {description && (
                    <Text style={styles.chartDescription}>{description}</Text>
                )}
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    barWrapper: {
        alignItems: 'center',
    },
    barBackground: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    label: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
        textAlign: 'center',
    },
    valueText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        textAlign: 'center',
    },
    chartContainer: {
        padding: 16,
    },
    chartHeader: {
        marginBottom: 16,
    },
    chartTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: '#FFFFFF',
    },
    chartDescription: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
});
