import { Transaction } from '@/store/transactionStore';
import React, { createContext, useContext, useState } from 'react';

interface EditSheetContextType {
    isOpen: boolean;
    transaction: Transaction | null;
    openSheet: (transaction: Transaction) => void;
    closeSheet: () => void;
}

const EditSheetContext = createContext<EditSheetContextType>({
    isOpen: false,
    transaction: null,
    openSheet: () => { },
    closeSheet: () => { },
});

export function EditSheetProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | null>(null);

    const openSheet = (t: Transaction) => {
        setTransaction(t);
        setIsOpen(true);
    };

    const closeSheet = () => {
        setIsOpen(false);
        // Delay clearing transaction for animation
        setTimeout(() => setTransaction(null), 300);
    };

    return (
        <EditSheetContext.Provider value={{ isOpen, transaction, openSheet, closeSheet }}>
            {children}
        </EditSheetContext.Provider>
    );
}

export const useEditSheet = () => useContext(EditSheetContext);
