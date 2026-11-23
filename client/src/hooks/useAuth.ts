// hooks/useAuth.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role?: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // 🔹 Só acessa localStorage no client side
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  const { 
    data: user, 
    isLoading, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["auth", "me", token],
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<User> => {
      if (!token) throw new Error("No token");

      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        setToken(null);
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error(`Auth failed: ${res.status}`);
      }

      const data = await res.json();
      return data.user;
    },
    enabled: !!token,
  });

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    // 🔹 Aguarda um pouco e depois invalida as queries
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }, 100);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.removeQueries({ queryKey: ["auth", "me"] });
    queryClient.clear();
  };

  return {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!user && !error && !!token,
    error,
    token,
    login,
    logout,
    refetch,
  };
}