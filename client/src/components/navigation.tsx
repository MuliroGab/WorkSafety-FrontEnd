import { Link, useLocation } from "wouter";
import { Shield, Bell, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";


const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Training", href: "/training" },
  { name: "Checklists", href: "/checklists" },
  { name: "Documents", href: "/documents" },
];

export default function Navigation() {
  const [location, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // 🔹 Move o useQuery para fora de qualquer condicional
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
    enabled: isAuthenticated, // 🔹 Só busca notificações se estiver autenticado
  });

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      
      try {
        const response = await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.warn("Backend logout failed");
        }
        return response.json();
      } catch (error) {
        console.warn("Logout request failed");
        return Promise.resolve();
      }
    },
    onSuccess: () => {
      logout();
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      logout();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // 🔹 Se não estiver autenticado, não renderiza o navigation
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="relative mr-3">
                <Shield className="h-8 w-8 text-[#019628]" />
                <Plus className="h-4 w-4 text-[#019628] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SafetyFirst</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={location === item.href ? "default" : "ghost"}
                      className={location === item.href ? "bg-[#019628] hover:bg-[#017a20]" : ""}
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Welcome, {user?.name || user?.username || "User"}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}