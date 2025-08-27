import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/StatsCard";
import { CheckCircle, Clock, AlertTriangle, PieChart, Upload, Camera, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const { userData } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/users/stats', userData?.id],
    enabled: !!userData,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/users/activity', userData?.id],
    enabled: !!userData,
  });

  const { data: upcomingDeadlines } = useQuery({
    queryKey: ['/api/deadlines/upcoming', userData?.id],
    enabled: !!userData,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="text-green-600 text-sm" />;
      case 'camera':
        return <Camera className="text-blue-600 text-sm" />;
      case 'reminder':
        return <Bell className="text-orange-600 text-sm" />;
      default:
        return <CheckCircle className="text-green-600 text-sm" />;
    }
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'bg-red-100 text-red-700 border-red-200';
    if (daysLeft <= 5) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getUrgencyText = (daysLeft: number) => {
    if (daysLeft <= 0) return 'Vencido';
    if (daysLeft === 1) return '1 día';
    if (daysLeft <= 5) return `${daysLeft} días`;
    return `${daysLeft} días`;
  };

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {userData?.firstName || 'Usuario'}
        </h2>
        <p className="text-gray-600">
          Aquí tienes un resumen de tu actividad y próximas fechas límite
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Documentos Subidos"
          value={stats?.uploaded || 0}
          icon={CheckCircle}
          iconColor="bg-green-100"
        />
        <StatsCard
          title="Pendientes"
          value={stats?.pending || 0}
          icon={Clock}
          iconColor="bg-orange-100"
          valueColor="text-orange-600"
        />
        <StatsCard
          title="Próximas Fechas"
          value={stats?.upcoming || 0}
          icon={AlertTriangle}
          iconColor="bg-red-100"
          valueColor="text-red-600"
        />
        <StatsCard
          title="Tasa de Cumplimiento"
          value={stats?.compliance ? `${stats.compliance}%` : '0%'}
          icon={PieChart}
          iconColor="bg-blue-100"
          valueColor="text-primary"
        />
      </div>

      {/* Recent Activity & Upcoming Deadlines */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card data-testid="recent-activity-card">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {format(new Date(activity.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card data-testid="upcoming-deadlines-card">
          <CardHeader>
            <CardTitle>Próximas Fechas Límite</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline: any) => {
                  const dueDate = new Date(deadline.dueDate);
                  const now = new Date();
                  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={deadline.id} 
                      className={`border rounded-xl p-4 ${getUrgencyColor(daysLeft)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {deadline.title}
                        </h4>
                        <Badge className="text-xs">
                          {getUrgencyText(daysLeft)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {deadline.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          Vence: {format(dueDate, "dd MMM yyyy", { locale: es })}
                        </span>
                        <Button size="sm" data-testid="upload-now-button">
                          Subir Ahora
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay fechas límite próximas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
