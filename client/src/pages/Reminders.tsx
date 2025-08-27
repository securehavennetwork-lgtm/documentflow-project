import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Clock, Plus, Edit, Trash2, Send, Calendar, Mail, MessageSquare, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Reminders() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentType: "",
    dueDate: "",
    reminderDays: 3,
    reminderTypes: {
      email: true,
      sms: false,
      push: true
    },
    isGlobal: true,
    targetUsers: [] as string[]
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['/api/admin/reminders'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: documentTypes = [] } = useQuery({
    queryKey: ['/api/admin/document-types'],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: any) => {
      const response = await fetch('/api/admin/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
      });
      if (!response.ok) throw new Error('Failed to create reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reminders'] });
      toast({ title: "Recordatorio creado exitosamente" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear recordatorio",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, ...reminderData }: any) => {
      const response = await fetch(`/api/admin/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
      });
      if (!response.ok) throw new Error('Failed to update reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reminders'] });
      toast({ title: "Recordatorio actualizado exitosamente" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await fetch(`/api/admin/reminders/${reminderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reminders'] });
      toast({ title: "Recordatorio eliminado exitosamente" });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await fetch(`/api/admin/reminders/${reminderId}/send`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to send reminder');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Recordatorio enviado exitosamente" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      documentType: "",
      dueDate: "",
      reminderDays: 3,
      reminderTypes: {
        email: true,
        sms: false,
        push: true
      },
      isGlobal: true,
      targetUsers: []
    });
    setEditingReminder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReminder) {
      updateReminderMutation.mutate({ id: editingReminder.id, ...formData });
    } else {
      createReminderMutation.mutate(formData);
    }
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      documentType: reminder.documentType,
      dueDate: format(new Date(reminder.dueDate), "yyyy-MM-dd"),
      reminderDays: reminder.reminderDays || 3,
      reminderTypes: reminder.reminderTypes || { email: true, sms: false, push: true },
      isGlobal: reminder.isGlobal,
      targetUsers: reminder.targetUsers || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (reminderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) {
      deleteReminderMutation.mutate(reminderId);
    }
  };

  const handleSendReminder = (reminderId: string) => {
    sendReminderMutation.mutate(reminderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'sent':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'scheduled':
        return 'Programado';
      case 'sent':
        return 'Enviado';
      default:
        return status;
    }
  };

  return (
    <div data-testid="reminders-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Recordatorios</h2>
        <p className="text-gray-600">Configura recordatorios automáticos para fechas límite de documentos</p>
      </div>

      {/* Create Reminder Button */}
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} data-testid="create-reminder-button">
              <Plus className="mr-2 h-4 w-4" />
              Crear Recordatorio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="reminder-dialog">
            <DialogHeader>
              <DialogTitle>
                {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Título del Recordatorio</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ej: Subir comprobante de domicilio"
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción detallada del documento requerido..."
                    data-testid="textarea-description"
                  />
                </div>

                <div>
                  <Label>Tipo de Documento</Label>
                  <Select 
                    value={formData.documentType} 
                    onValueChange={(value) => setFormData({...formData, documentType: value})}
                  >
                    <SelectTrigger data-testid="select-document-type">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="identification">Identificación Oficial</SelectItem>
                      <SelectItem value="address_proof">Comprobante de Domicilio</SelectItem>
                      <SelectItem value="education_certificate">Certificado de Estudios</SelectItem>
                      <SelectItem value="work_contract">Contrato de Trabajo</SelectItem>
                      <SelectItem value="rfc">RFC</SelectItem>
                      <SelectItem value="curp">CURP</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dueDate">Fecha Límite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    required
                    data-testid="input-due-date"
                  />
                </div>

                <div>
                  <Label htmlFor="reminderDays">Días de Anticipación</Label>
                  <Select 
                    value={formData.reminderDays.toString()} 
                    onValueChange={(value) => setFormData({...formData, reminderDays: parseInt(value)})}
                  >
                    <SelectTrigger data-testid="select-reminder-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 día</SelectItem>
                      <SelectItem value="3">3 días</SelectItem>
                      <SelectItem value="5">5 días</SelectItem>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Alcance</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={formData.isGlobal}
                      onCheckedChange={(checked) => setFormData({...formData, isGlobal: checked})}
                      data-testid="switch-global"
                    />
                    <span className="text-sm">
                      {formData.isGlobal ? 'Todos los usuarios' : 'Usuarios específicos'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reminder Types */}
              <div>
                <Label>Tipos de Notificación</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.reminderTypes.email}
                      onCheckedChange={(checked) => setFormData({
                        ...formData, 
                        reminderTypes: {...formData.reminderTypes, email: checked}
                      })}
                      data-testid="switch-email"
                    />
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.reminderTypes.sms}
                      onCheckedChange={(checked) => setFormData({
                        ...formData, 
                        reminderTypes: {...formData.reminderTypes, sms: checked}
                      })}
                      data-testid="switch-sms"
                    />
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.reminderTypes.push}
                      onCheckedChange={(checked) => setFormData({
                        ...formData, 
                        reminderTypes: {...formData.reminderTypes, push: checked}
                      })}
                      data-testid="switch-push"
                    />
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Push</span>
                  </div>
                </div>
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
                  disabled={createReminderMutation.isPending || updateReminderMutation.isPending}
                  data-testid="save-reminder-button"
                >
                  {createReminderMutation.isPending || updateReminderMutation.isPending 
                    ? "Guardando..." 
                    : editingReminder ? "Actualizar" : "Crear Recordatorio"
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reminders Grid */}
      {reminders.length > 0 ? (
        <div className="grid gap-6" data-testid="reminders-grid">
          {reminders.map((reminder: any) => (
            <Card key={reminder.id} data-testid={`reminder-card-${reminder.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{reminder.title}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={`text-xs ${getStatusColor(reminder.status)}`}>
                        {getStatusText(reminder.status)}
                      </Badge>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Vence: {format(new Date(reminder.dueDate), "dd MMM yyyy", { locale: es })}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {reminder.reminderDays} días antes
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(reminder.id)}
                      disabled={sendReminderMutation.isPending}
                      data-testid={`send-reminder-${reminder.id}`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(reminder)}
                      data-testid={`edit-reminder-${reminder.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-reminder-${reminder.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reminder.description && (
                  <p className="text-gray-600 mb-4">{reminder.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tipo de documento:</span>
                    <br />
                    <span className="text-gray-600">{reminder.documentType}</span>
                  </div>
                  <div>
                    <span className="font-medium">Alcance:</span>
                    <br />
                    <span className="text-gray-600">
                      {reminder.isGlobal ? 'Todos los usuarios' : `${reminder.targetUsers?.length || 0} usuarios específicos`}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Métodos de notificación:</span>
                    <br />
                    <div className="flex space-x-2 mt-1">
                      {reminder.reminderTypes?.email && (
                        <Badge variant="outline" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />Email
                        </Badge>
                      )}
                      {reminder.reminderTypes?.sms && (
                        <Badge variant="outline" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />SMS
                        </Badge>
                      )}
                      {reminder.reminderTypes?.push && (
                        <Badge variant="outline" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" />Push
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Creado:</span>
                    <br />
                    <span className="text-gray-600">
                      {format(new Date(reminder.createdAt), "dd MMM yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <div className="text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay recordatorios configurados</p>
            <p className="text-sm text-gray-400">Crea tu primer recordatorio para automatizar las notificaciones</p>
          </div>
        </Card>
      )}
    </div>
  );
}
