import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload } from "lucide-react";

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast({ title: "Inicio de sesión exitoso" });
    } catch (error: any) {
      toast({ 
        title: "Error de inicio de sesión", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(registerData);
      toast({ title: "Cuenta creada exitosamente" });
    } catch (error: any) {
      toast({ 
        title: "Error al crear cuenta", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="auth-modal">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CloudUpload className="text-white text-2xl" />
          </div>
          <CardTitle className="text-2xl">DocumentFlow</CardTitle>
          <CardDescription>Sistema de gestión de archivos inteligente</CardDescription>
        </CardHeader>

        <CardContent>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6" data-testid="login-form">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  data-testid="input-login-email"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  data-testid="input-login-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                data-testid="button-login"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                    required
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    placeholder="Pérez"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                    required
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@empresa.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                  data-testid="input-register-email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label>Departamento</Label>
                <Select onValueChange={(value) => setRegisterData({...registerData, department: value})}>
                  <SelectTrigger data-testid="select-department">
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="Finanzas">Finanzas</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="registerPassword">Contraseña</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                  data-testid="input-register-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                data-testid="button-register"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              data-testid="button-toggle-auth"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
