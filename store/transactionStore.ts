import {
    addTransaction as addTransactionToFirebase,
    deleteTransaction as deleteTransactionFromFirebase,
    updateTransaction as updateTransactionInFirebase
} from '@/services/transactionService';
import { useWalletStore } from '@/store/walletStore';
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
        'Salary': 'cash',
        'Gift': 'gift',
        'Other': 'pricetag',
    };
    return icons[category] || 'pricetag';
}

/**
 * Calculate the balance change based on transaction type.
 * Income adds to balance, expense subtracts.
 */
function getBalanceChange(amount: number, type?: 'income' | 'expense'): number {
    return type === 'income' ? amount : -amount;
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

                // Update wallet balance
                const balanceChange = getBalanceChange(t.amount, t.type);
                useWalletStore.getState().updateBalance(t.source_wallet, balanceChange);

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
                        type: t.type,
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
                // Find the original transaction to calculate balance difference
                const original = get().transactions.find(tx => tx.id === id);

                if (original) {
                    // Calculate old effect and new effect
                    const oldBalanceChange = getBalanceChange(original.amount, original.type);

                    // Get new values (fallback to original if not changed)
                    const newAmount = data.amount ?? original.amount;
                    const newType = data.type ?? original.type;
                    const newWallet = data.source_wallet ?? original.source_wallet;
                    const newBalanceChange = getBalanceChange(newAmount, newType);

                    // If wallet changed, adjust both wallets
                    if (newWallet !== original.source_wallet) {
                        // Reverse effect on old wallet
                        useWalletStore.getState().updateBalance(original.source_wallet, -oldBalanceChange);
                        // Apply new effect on new wallet
                        useWalletStore.getState().updateBalance(newWallet, newBalanceChange);
                    } else {
                        // Same wallet - just update the difference
                        const diff = newBalanceChange - oldBalanceChange;
                        if (diff !== 0) {
                            useWalletStore.getState().updateBalance(original.source_wallet, diff);
                        }
                    }
                }

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
                // Find the transaction to reverse its balance effect
                const toDelete = get().transactions.find(tx => tx.id === id);

                if (toDelete) {
                    // Reverse the balance change
                    const balanceChange = getBalanceChange(toDelete.amount, toDelete.type);
                    useWalletStore.getState().updateBalance(toDelete.source_wallet, -balanceChange);
                }

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
