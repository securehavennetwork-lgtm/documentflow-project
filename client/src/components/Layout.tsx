import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CloudUpload, 
  LayoutDashboard, 
  Upload, 
  FolderOpen, 
  Calendar, 
  Bell,
  BarChart3,
  Users,
  Clock,
  Menu,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { userData, logout } = useAuth();

  const isAdmin = userData?.role === "admin";

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Subir Archivos", href: "/upload", icon: Upload },
    { name: "Mis Documentos", href: "/documents", icon: FolderOpen },
    { name: "Fechas Límite", href: "/deadlines", icon: Calendar },
    { name: "Notificaciones", href: "/notifications", icon: Bell },
  ];

  const adminNavigation = [
    { name: "Estadísticas", href: "/admin", icon: BarChart3 },
    { name: "Gestión de Usuarios", href: "/admin/users", icon: Users },
    { name: "Recordatorios", href: "/admin/reminders", icon: Clock },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="toggle-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <CloudUpload className="text-white text-sm" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">DocumentFlow</h1>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                    {userData ? `${userData.firstName[0]}${userData.lastName[0]}` : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userData ? `${userData.firstName} ${userData.lastName}` : "Usuario"}
                  </p>
                  <p className="text-xs text-gray-600">{userData?.role || "Usuario"}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 transform transition-transform duration-300 ease-in-out w-64 bg-white shadow-lg z-30 mt-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <nav className="h-full px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                    location === item.href 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )} data-testid={`nav-${item.href}`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </a>
                </Link>
              );
            })}
            
            {/* Admin Only */}
            {isAdmin && (
              <div className="pt-4 border-t border-gray-200">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Administración
                </p>
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                        location === item.href 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-100"
                      )} data-testid={`nav-admin-${item.href}`}>
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </a>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
