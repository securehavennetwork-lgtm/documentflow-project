import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Documents from "@/pages/Documents";
import Deadlines from "@/pages/Deadlines";
import Notifications from "@/pages/Notifications";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/UserManagement";
import Reminders from "@/pages/Reminders";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/upload" component={Upload} />
        <Route path="/documents" component={Documents} />
        <Route path="/deadlines" component={Deadlines} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={UserManagement} />
        <Route path="/admin/reminders" component={Reminders} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AuthenticatedApp />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
