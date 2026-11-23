// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 🔹 Recupera o token do localStorage no mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
  }, []);

  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async (): Promise<User> => {
      if (!token) throw new Error('No token');

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        setToken(null);
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('Auth failed');
      }

      const data = await response.json();
      return data.user;
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // 🔹 Força o refetch dos dados do usuário
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user && !error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}