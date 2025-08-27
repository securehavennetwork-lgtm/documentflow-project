import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Deadlines() {
  const { userData } = useAuth();

  const { data: deadlines = [] } = useQuery({
    queryKey: ['/api/deadlines', userData?.id],
    enabled: !!userData,
  });

  const getUrgencyLevel = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { level: 'overdue', color: 'bg-red-100 text-red-700 border-red-200', text: 'Vencido' };
    if (daysLeft === 0) return { level: 'today', color: 'bg-red-100 text-red-700 border-red-200', text: 'Hoy' };
    if (daysLeft === 1) return { level: 'tomorrow', color: 'bg-red-100 text-red-700 border-red-200', text: '1 día' };
    if (daysLeft <= 5) return { level: 'urgent', color: 'bg-orange-100 text-orange-700 border-orange-200', text: `${daysLeft} días` };
    if (daysLeft <= 15) return { level: 'soon', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: `${daysLeft} días` };
    return { level: 'future', color: 'bg-blue-100 text-blue-700 border-blue-200', text: `${daysLeft} días` };
  };

  const groupedDeadlines = deadlines.reduce((acc: any, deadline: any) => {
    const urgency = getUrgencyLevel(deadline.dueDate);
    if (!acc[urgency.level]) {
      acc[urgency.level] = [];
    }
    acc[urgency.level].push({ ...deadline, urgency });
    return acc;
  }, {});

  const sectionOrder = ['overdue', 'today', 'tomorrow', 'urgent', 'soon', 'future'];
  const sectionTitles = {
    overdue: 'Vencidos',
    today: 'Vencen Hoy',
    tomorrow: 'Vencen Mañana', 
    urgent: 'Próximos (1-5 días)',
    soon: 'Pronto (6-15 días)',
    future: 'Futuro (15+ días)'
  };

  return (
    <div data-testid="deadlines-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fechas Límite</h2>
        <p className="text-gray-600">Gestiona las fechas límite de todos tus documentos</p>
      </div>

      {deadlines.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tienes fechas límite pendientes</p>
            <p className="text-sm text-gray-400">Las fechas límite aparecerán aquí cuando se asignen</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {sectionOrder.map((section) => {
            const sectionDeadlines = groupedDeadlines[section];
            if (!sectionDeadlines?.length) return null;

            return (
              <div key={section} data-testid={`deadline-section-${section}`}>
                <div className="flex items-center space-x-2 mb-4">
                  {section === 'overdue' || section === 'today' || section === 'tomorrow' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : section === 'urgent' ? (
                    <Clock className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-blue-600" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900">
                    {sectionTitles[section as keyof typeof sectionTitles]}
                  </h3>
                  <Badge variant="outline">{sectionDeadlines.length}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {sectionDeadlines.map((deadline: any) => (
                    <Card 
                      key={deadline.id} 
                      className={`border ${deadline.urgency.color}`}
                      data-testid={`deadline-card-${deadline.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {deadline.title}
                          </h4>
                          <Badge className="text-xs">
                            {deadline.urgency.text}
                          </Badge>
                        </div>
                        
                        {deadline.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {deadline.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            Vence: {format(new Date(deadline.dueDate), "dd MMM yyyy", { locale: es })}
                          </span>
                          <Button 
                            size="sm"
                            data-testid={`upload-for-deadline-${deadline.id}`}
                          >
                            Subir Documento
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
