import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, Unsubscribe, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Wallet {
    id?: string;
    name: string;
    balance: number;
    colors: [string, string]; // Gradient colors
    userId: string;
    icon?: string;
    accountNumber?: string;
}

const COLLECTION_NAME = 'wallets';

// Default wallets for new users
export const DEFAULT_WALLETS: Omit<Wallet, 'id' | 'userId'>[] = [
    { name: 'BCA', balance: 0, colors: ['#005C97', '#363795'], icon: '🏦' },
    { name: 'GoPay', balance: 0, colors: ['#00B4DB', '#0083B0'], icon: '📱' },
    { name: 'OVO', balance: 0, colors: ['#8E2DE2', '#4A00E0'], icon: '💎' },
    { name: 'Cash', balance: 0, colors: ['#11998e', '#38ef7d'], icon: '💵' },
];

function isFirebaseConfigured(): boolean {
    return db !== null;
}

// Initialize wallets for a new user
export async function initializeWallets(userId: string): Promise<void> {
    if (!isFirebaseConfigured()) return;

    try {
        // Check if user already has wallets
        const existing = await getWallets(userId);
        if (existing.length > 0) {
            console.log('✅ User already has wallets');
            return;
        }

        // Create default wallets
        for (const wallet of DEFAULT_WALLETS) {
            await addWallet(userId, wallet);
        }
        console.log('✅ Initialized default wallets for user');
    } catch (error) {
        console.error('❌ Error initializing wallets:', error);
    }
}

// Add a new wallet
export async function addWallet(userId: string, wallet: Omit<Wallet, 'id' | 'userId'>): Promise<string | null> {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured');
        return null;
    }

    try {
        const docRef = await addDoc(collection(db!, COLLECTION_NAME), {
            ...wallet,
            userId,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Wallet added:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding wallet:', error);
        return null;
    }
}

// Get all wallets for a user
export async function getWallets(userId: string): Promise<Wallet[]> {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured - returning defaults');
        return DEFAULT_WALLETS.map((w, i) => ({ ...w, id: `local-${i}`, userId }));
    }

    try {
        const q = query(
            collection(db!, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('name', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const wallets: Wallet[] = [];

        querySnapshot.forEach((doc) => {
            wallets.push({
                id: doc.id,
                ...doc.data()
            } as Wallet);
        });

        console.log(`✅ Fetched ${wallets.length} wallets`);
        return wallets;
    } catch (error) {
        console.error('❌ Error getting wallets:', error);
        return DEFAULT_WALLETS.map((w, i) => ({ ...w, id: `local-${i}`, userId }));
    }
}

// Update wallet (e.g., balance change)
export async function updateWallet(
    walletId: string,
    data: Partial<Omit<Wallet, 'id' | 'userId'>>
): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;

    try {
        const docRef = doc(db!, COLLECTION_NAME, walletId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        console.log('✅ Wallet updated:', walletId);
        return true;
    } catch (error) {
        console.error('❌ Error updating wallet:', error);
        return false;
    }
}

// Update wallet balance (helper for transactions)
export async function updateWalletBalance(
    walletId: string,
    amountChange: number
): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;

    try {
        const wallets = await getWallets('');
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) return false;

        return await updateWallet(walletId, {
            balance: wallet.balance + amountChange
        });
    } catch (error) {
        console.error('❌ Error updating wallet balance:', error);
        return false;
    }
}

// Delete a wallet
export async function deleteWallet(walletId: string): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;

    try {
        const docRef = doc(db!, COLLECTION_NAME, walletId);
        await deleteDoc(docRef);
        console.log('✅ Wallet deleted:', walletId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting wallet:', error);
        return false;
    }
}

// Real-time subscription
export function subscribeToWallets(
    userId: string,
    callback: (wallets: Wallet[]) => void
): Unsubscribe | null {
    if (!isFirebaseConfigured()) {
        callback(DEFAULT_WALLETS.map((w, i) => ({ ...w, id: `local-${i}`, userId })));
        return null;
    }

    try {
        const q = query(
            collection(db!, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('name', 'asc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const wallets: Wallet[] = [];
            querySnapshot.forEach((doc) => {
                wallets.push({
                    id: doc.id,
                    ...doc.data()
                } as Wallet);
            });
            callback(wallets);
        });
    } catch (error) {
        console.error('❌ Error subscribing to wallets:', error);
        return null;
    }
}
