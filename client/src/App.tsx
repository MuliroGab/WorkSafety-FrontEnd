// App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Training from "@/pages/training";
import Checklists from "@/pages/checklists";
import Documents from "@/pages/documents";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotificationToast from "@/components/notification-toast";
import EmergencyButton from "@/components/emergency-button";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // 🔹 Loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#019628]"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <Navigation />}
      <Switch>
        {/* Rotas públicas */}
        {!isAuthenticated && (
          <>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/" component={Login} />
          </>
        )}

        {/* Rotas protegidas */}
        {isAuthenticated && (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/training" component={Training} />
            <Route path="/checklists" component={Checklists} />
            <Route path="/documents" component={Documents} />
          </>
        )}

        {/* Fallback */}
        <Route component={isAuthenticated ? NotFound : Login} />
      </Switch>
      
      {isAuthenticated && (
        <>
          <EmergencyButton />
          <NotificationToast />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <div className="min-h-screen bg-gray-50">
            <Router />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;