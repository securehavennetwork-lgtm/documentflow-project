import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from "@/components/StatsCard";
import { Users, FileText, PieChart, AlertTriangle, Download, Eye, Bell, Search, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDashboard() {
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [documentStatusFilter, setDocumentStatusFilter] = useState("all");

  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: departmentCompliance } = useQuery({
    queryKey: ['/api/admin/compliance-by-department'],
  });

  const { data: documentTypes } = useQuery({
    queryKey: ['/api/admin/document-types'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users-status'],
  });

  const { data: allDocuments } = useQuery({
    queryKey: ['/api/admin/documents', documentSearch, documentTypeFilter, documentStatusFilter],
  });

  const handleExportReport = () => {
    // TODO: Implement export functionality
    window.open('/api/admin/export/compliance-report', '_blank');
  };

  const handleSendReminder = (userId: string) => {
    // TODO: Implement send reminder
    console.log(`Sending reminder to user ${userId}`);
  };

  const handleViewUserDetails = (userId: string) => {
    // TODO: Navigate to user detail view
    console.log(`Viewing details for user ${userId}`);
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'incomplete':
        return 'bg-orange-100 text-orange-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Completo';
      case 'incomplete':
        return 'Incompleto';
      case 'overdue':
        return 'Vencido';
      default:
        return status;
    }
  };

  return (
    <div data-testid="admin-dashboard-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h2>
        <p className="text-gray-600">Estadísticas y métricas de cumplimiento del sistema</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Usuarios"
          value={adminStats?.totalUsers || 0}
          subtitle={`+${adminStats?.newUsersThisMonth || 0} este mes`}
          icon={Users}
          iconColor="bg-blue-100"
        />
        <StatsCard
          title="Documentos Totales"
          value={adminStats?.totalDocuments || 0}
          subtitle={`+${adminStats?.newDocumentsThisWeek || 0} esta semana`}
          icon={FileText}
          iconColor="bg-green-100"
        />
        <StatsCard
          title="Cumplimiento Global"
          value={adminStats?.compliance ? `${adminStats.compliance}%` : '0%'}
          subtitle={`${adminStats?.complianceChange || 0}% vs mes anterior`}
          icon={PieChart}
          iconColor="bg-purple-100"
        />
        <StatsCard
          title="Documentos Vencidos"
          value={adminStats?.overdue || 0}
          subtitle="Requieren acción"
          icon={AlertTriangle}
          iconColor="bg-red-100"
          valueColor="text-red-600"
        />
      </div>

      {/* Charts & Analytics */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Compliance Chart */}
        <Card data-testid="compliance-chart-card">
          <CardHeader>
            <CardTitle>Cumplimiento por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentCompliance && departmentCompliance.length > 0 ? (
              <div className="space-y-4">
                {departmentCompliance.map((dept: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {dept.name}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getComplianceColor(dept.percentage)}`}
                          style={{ width: `${dept.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {dept.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No hay datos de cumplimiento disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Types */}
        <Card data-testid="document-types-card">
          <CardHeader>
            <CardTitle>Tipos de Documentos Más Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            {documentTypes && documentTypes.length > 0 ? (
              <div className="space-y-4">
                {documentTypes.map((type: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-blue-600 h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {type.name}
                      </span>
                    </div>
                    <span className="text-gray-600 font-medium">
                      {type.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No hay datos de tipos de documentos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Documents Management */}
        <Card data-testid="all-documents-card">
          <CardHeader>
            <CardTitle>Gestión de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Buscar documentos..."
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="identification">Identificación</SelectItem>
                    <SelectItem value="address_proof">Comprobantes</SelectItem>
                    <SelectItem value="education_certificate">Certificados</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={documentStatusFilter} onValueChange={setDocumentStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processed">Procesado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {allDocuments?.length || 0} documentos encontrados
                </p>
                <Button size="sm" className="w-full">
                  Ver Todos los Documentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Status Table */}
      <Card data-testid="user-status-table-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estado de Usuarios</CardTitle>
            <Button onClick={handleExportReport} data-testid="export-report">
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Departamento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Documentos</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Última Actividad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {user.department}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {user.documentsUploaded}/{user.documentsRequired}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {user.lastActivity ? format(new Date(user.lastActivity), "dd MMM, HH:mm", { locale: es }) : 'Nunca'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendReminder(user.id)}
                            data-testid={`send-reminder-${user.id}`}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUserDetails(user.id)}
                            data-testid={`view-user-${user.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Documents from All Users */}
      <Card className="mt-8" data-testid="recent-all-documents-card">
        <CardHeader>
          <CardTitle>Documentos Recientes de Todos los Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {allDocuments && allDocuments.length > 0 ? (
            <div className="space-y-4">
              {allDocuments.slice(0, 10).map((document: any) => (
                <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-blue-600 h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {document.originalName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Por: {document.user?.firstName} {document.user?.lastName} ({document.user?.department})
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(document.uploadedAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                      {getStatusText(document.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(document.storageUrl, '_blank')}
                      data-testid={`view-document-${document.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay documentos disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
