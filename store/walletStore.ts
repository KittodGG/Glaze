import { DEFAULT_WALLETS, Wallet } from '@/services/walletService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WalletState {
    wallets: Wallet[];
    isLoading: boolean;
    setWallets: (wallets: Wallet[]) => void;
    addWallet: (wallet: Wallet) => void;
    updateWallet: (id: string, data: Partial<Wallet>) => void;
    deleteWallet: (id: string) => void;
    updateBalance: (walletName: string, amountChange: number) => void;
    setLoading: (loading: boolean) => void;
}

// Initialize with default wallets (local IDs)
const INITIAL_WALLETS: Wallet[] = DEFAULT_WALLETS.map((w, i) => ({
    ...w,
    id: `local-${i}`,
    userId: 'local'
}));

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            wallets: INITIAL_WALLETS,
            isLoading: false,

            setWallets: (wallets) => set({ wallets }),

            addWallet: (wallet) => set((state) => ({
                wallets: [...state.wallets, wallet]
            })),

            updateWallet: (id, data) => set((state) => ({
                wallets: state.wallets.map(w =>
                    w.id === id ? { ...w, ...data } : w
                )
            })),

            deleteWallet: (id) => set((state) => ({
                wallets: state.wallets.filter(w => w.id !== id)
            })),

            updateBalance: (walletName, amountChange) => set((state) => ({
                wallets: state.wallets.map(w =>
                    w.name === walletName
                        ? { ...w, balance: w.balance + amountChange }
                        : w
                )
            })),

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'wallet-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
