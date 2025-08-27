import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare, Check, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Notifications() {
  const { userData } = useAuth();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications', userData?.id],
    enabled: !!userData,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({ title: "Notificación eliminada" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/users/notification-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Configuración actualizada" });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Bell className="h-4 w-4 text-orange-600" />;
      case 'deadline':
        return <Bell className="h-4 w-4 text-red-600" />;
      case 'upload_success':
        return <Check className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate({
      emailNotifications,
      smsNotifications,
      pushNotifications,
      reminderDays,
    });
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div data-testid="notifications-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Notificaciones</h2>
        <p className="text-gray-600">Gestiona tus notificaciones y preferencias</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Notification Settings */}
        <div className="lg:col-span-1">
          <Card data-testid="notification-settings-card">
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    data-testid="switch-email"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                  </Label>
                  <Switch
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                    data-testid="switch-sms"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Push</span>
                  </Label>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                    data-testid="switch-push"
                  />
                </div>
              </div>

              <div>
                <Label>Recordatorios (días antes del vencimiento)</Label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  data-testid="select-reminder-days"
                >
                  <option value={1}>1 día</option>
                  <option value={3}>3 días</option>
                  <option value={5}>5 días</option>
                  <option value={7}>7 días</option>
                </select>
              </div>

              <Button 
                onClick={handleUpdateSettings}
                className="w-full"
                disabled={updateSettingsMutation.isPending}
                data-testid="save-settings"
              >
                {updateSettingsMutation.isPending ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card data-testid="notifications-list-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Mis Notificaciones
                  {unreadCount > 0 && (
                    <Badge className="ml-2">{unreadCount} sin leer</Badge>
                  )}
                </CardTitle>
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => notifications.forEach((n: any) => !n.isRead && handleMarkAsRead(n.id))}
                    data-testid="mark-all-read"
                  >
                    Marcar todas como leídas
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border ${
                        notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      }`}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {format(new Date(notification.sentAt), "dd MMM yyyy, HH:mm", { locale: es })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              data-testid={`mark-read-${notification.id}`}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`delete-${notification.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
