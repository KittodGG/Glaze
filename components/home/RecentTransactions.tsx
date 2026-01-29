import { SwipeableTransaction } from '@/components/home/SwipeableTransaction';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEditSheet } from '@/context/EditSheetContext';
import { Transaction, useTransactionStore } from '@/store/transactionStore';
import { StyleSheet, Text, View } from 'react-native';

export function RecentTransactions() {
    const transactions = useTransactionStore((s) => s.transactions);
    const { openSheet } = useEditSheet();

    const handlePress = (item: Transaction) => {
        openSheet(item);
    };

    // Show empty state if no transactions
    if (transactions.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={[styles.header, { color: '#FFFFFF' }]}>Recent Activity</Text>
                <EmptyState
                    icon="wallet-outline"
                    title="No transactions yet"
                    message="Tap + to start tracking your spending"
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: '#FFFFFF' }]}>Recent Activity</Text>
            <View style={styles.listWrapper}>
                {transactions.slice(0, 10).map((item) => (
                    <SwipeableTransaction
                        key={item.id}
                        item={item}
                        onPress={handlePress}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 180, // Generous space for floating dock
    },
    header: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 20,
        marginBottom: 16,
    },
    listWrapper: {
        minHeight: 100,
    },
});

