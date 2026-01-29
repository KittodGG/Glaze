import {
    addTransaction as addTransactionToFirebase,
    deleteTransaction as deleteTransactionFromFirebase,
    updateTransaction as updateTransactionInFirebase
} from '@/services/transactionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    category: string;
    source_wallet: string;
    date: string; // ISO string
    icon: string;
    type?: 'income' | 'expense'; // Optional for backward compatibility
}

interface TransactionState {
    transactions: Transaction[];
    isLoading: boolean;
    userId: string;
    addTransaction: (t: Transaction, syncToFirebase?: boolean) => void;
    setTransactions: (t: Transaction[]) => void;
    updateTransaction: (id: string, data: Partial<Transaction>, syncToFirebase?: boolean) => void;
    deleteTransaction: (id: string, syncToFirebase?: boolean) => void;
    setUserId: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

// Icon mapping for categories
export function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        'Food': 'fast-food',
        'Drink': 'cafe',
        'Transport': 'car',
        'Shopping': 'cart',
        'Entertainment': 'game-controller',
        'Bills': 'receipt',
        'Health': 'medkit',
        'Education': 'school',
        'Subscription': 'film',
        'Other': 'pricetag',
    };
    return icons[category] || 'pricetag';
}

export const useTransactionStore = create<TransactionState>()(
    persist(
        (set, get) => ({
            transactions: [], // Start empty - real data comes from Firebase
            isLoading: false,
            userId: 'local', // Will be set when user logs in

            addTransaction: async (t, syncToFirebase = true) => {
                // Add to local state first (optimistic update)
                set((state) => ({ transactions: [t, ...state.transactions] }));

                // Sync to Firebase in background
                if (syncToFirebase) {
                    const { userId } = get();
                    const firebaseId = await addTransactionToFirebase(userId, {
                        title: t.title,
                        amount: t.amount,
                        category: t.category,
                        source_wallet: t.source_wallet,
                        date: t.date,
                        icon: t.icon,
                    });

                    // Update local ID with Firebase ID if successful
                    if (firebaseId) {
                        set((state) => ({
                            transactions: state.transactions.map(tx =>
                                tx.id === t.id ? { ...tx, id: firebaseId } : tx
                            )
                        }));
                    }
                }
            },

            setTransactions: (t) => set({ transactions: t }),

            updateTransaction: async (id, data, syncToFirebase = true) => {
                // Optimistic update
                set((state) => ({
                    transactions: state.transactions.map(tx =>
                        tx.id === id ? { ...tx, ...data } : tx
                    )
                }));

                // Sync to Firebase
                if (syncToFirebase) {
                    await updateTransactionInFirebase(id, data);
                }
            },

            deleteTransaction: async (id, syncToFirebase = true) => {
                // Optimistic delete
                set((state) => ({
                    transactions: state.transactions.filter(tx => tx.id !== id)
                }));

                // Sync to Firebase
                if (syncToFirebase) {
                    await deleteTransactionFromFirebase(id);
                }
            },

            setUserId: (userId) => set({ userId }),

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'transaction-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
