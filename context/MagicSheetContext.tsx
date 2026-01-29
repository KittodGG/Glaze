import React, { createContext, useContext, useState } from 'react';
import { Keyboard } from 'react-native';

interface MagicSheetContextType {
    isOpen: boolean;
    openSheet: () => void;
    closeSheet: () => void;
}

const MagicSheetContext = createContext<MagicSheetContextType>({
    isOpen: false,
    openSheet: () => { },
    closeSheet: () => { },
});

export function MagicSheetProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openSheet = () => setIsOpen(true);

    const closeSheet = () => {
        setIsOpen(false);
        Keyboard.dismiss();
    };

    return (
        <MagicSheetContext.Provider value={{ isOpen, openSheet, closeSheet }}>
            {children}
        </MagicSheetContext.Provider>
    );
}

export const useMagicSheet = () => useContext(MagicSheetContext);
