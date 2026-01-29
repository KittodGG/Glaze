import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, Unsubscribe, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Transaction {
    id?: string;
    title: string;
    amount: number;
    category: string;
    source_wallet: string;
    date: string; // ISO string
    icon: string;
    userId: string;
}

const COLLECTION_NAME = 'transactions';

// Check if Firebase is configured
function isFirebaseConfigured(): boolean {
    return db !== null;
}

// Add a new transaction
export async function addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'userId'>): Promise<string | null> {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured - using local storage only');
        return null;
    }

    try {
        const docRef = await addDoc(collection(db!, COLLECTION_NAME), {
            ...transaction,
            userId,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Transaction added to Firebase:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding transaction:', error);
        return null;
    }
}

// Get all transactions for a user
export async function getTransactions(userId: string): Promise<Transaction[]> {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured - returning empty array');
        return [];
    }

    try {
        const q = query(
            collection(db!, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const transactions: Transaction[] = [];

        querySnapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            } as Transaction);
        });

        console.log(`✅ Fetched ${transactions.length} transactions from Firebase`);
        return transactions;
    } catch (error) {
        console.error('❌ Error getting transactions:', error);
        return [];
    }
}

// Update a transaction
export async function updateTransaction(
    transactionId: string,
    data: Partial<Omit<Transaction, 'id' | 'userId'>>
): Promise<boolean> {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured');
        return false;
    }

    try {
        const docRef = doc(db!, COLLECTION_NAME, transactionId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        console.log('✅ Transaction updated:', transactionId);
        return true;
    } catch (error) {
        console.error('❌ Error updating transaction:', error);
        return false;
    }
}

// Delete a transaction
export async function deleteTransaction(transactionId: string): Promise<boolean> {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured');
        return false;
    }

    try {
        const docRef = doc(db!, COLLECTION_NAME, transactionId);
        await deleteDoc(docRef);
        console.log('✅ Transaction deleted:', transactionId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        return false;
    }
}

// Real-time listener for transactions
export function subscribeToTransactions(
    userId: string,
    callback: (transactions: Transaction[]) => void
): Unsubscribe | null {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured - no real-time sync');
        return null;
    }

    try {
        const q = query(
            collection(db!, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const transactions: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                transactions.push({
                    id: doc.id,
                    ...doc.data()
                } as Transaction);
            });
            callback(transactions);
        });
    } catch (error) {
        console.error('❌ Error subscribing to transactions:', error);
        return null;
    }
}
