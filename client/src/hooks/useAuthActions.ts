// hooks/useAuthActions.ts
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useAuthActions() {
  const { login, logout } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      login(data.token);
      // 🔹 O useAuth vai automaticamente refazer a query /api/auth/me
    },
  });

  return {
    login: loginMutation.mutate,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}