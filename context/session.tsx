'use client'
import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { bigCommerceSDK } from '../scripts/bcSdk';

const SessionContext = createContext({ context: '' });
const SessionProvider = ({ children }: { children: ReactNode }) => {
    const searchParams = useSearchParams()
    const contexts = searchParams.get('context');
    
    const [context, setContext] = useState('');

    useEffect(() => {
        if (contexts) {
            setContext(contexts.toString());
            // Keeps app in sync with BC (e.g. heatbeat, user logout, etc)
            bigCommerceSDK(contexts);
        }
    }, [contexts]);

    return (
        <SessionContext.Provider value={{ context }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);

export default SessionProvider;
