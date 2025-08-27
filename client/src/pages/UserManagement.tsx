import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "user"
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users', searchQuery, departmentFilter],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['/api/admin/departments'],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Usuario creado exitosamente" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: any) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Usuario actualizado exitosamente" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar usuario",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Usuario eliminado exitosamente" });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar usuario",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      role: "user"
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, ...formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      department: user.department,
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = searchQuery === "" || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  };

  return (
    <div data-testid="user-management-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
        <p className="text-gray-600">Administra usuarios y sus permisos</p>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-64"
              data-testid="search-users"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="md:w-48" data-testid="filter-department">
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {departments.map((dept: string) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} data-testid="add-user-button">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="user-dialog">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                      data-testid="input-firstName"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    data-testid="input-phone"
                  />
                </div>
                
                <div>
                  <Label>Departamento</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData({...formData, department: value})}
                  >
                    <SelectTrigger data-testid="select-department">
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: string) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Rol</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger data-testid="select-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="cancel-button"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    data-testid="save-user-button"
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending 
                      ? "Guardando..." 
                      : editingUser ? "Actualizar" : "Crear Usuario"
                    }
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Users Table */}
      <Card data-testid="users-table-card">
        <CardHeader>
          <CardTitle>
            Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.documentsCount || 0} subidos
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            data-testid={`edit-user-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {users.length === 0 
                  ? "No hay usuarios registrados" 
                  : "No se encontraron usuarios con los filtros aplicados"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
