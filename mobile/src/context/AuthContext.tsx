import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: number;
  email: string;
  name: string;
};

type AuthContextType = {
  session: { user: User | null } | null;
  loading: boolean;
  setSession: (session: { user: User | null } | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  setSession: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<{ user: User | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user info on mount
    const loadSession = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        const userStr = await AsyncStorage.getItem('user_info');
        
        if (token && userStr) {
          setSession({ user: JSON.parse(userStr) });
        }
      } catch (e) {
        console.error('Failed to load session', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
