import { useQuery } from "@tanstack/react-query";
import FileUpload from "@/components/FileUpload";
import CameraCapture from "@/components/CameraCapture";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, Download, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Upload() {
  const { userData } = useAuth();

  const { data: recentUploads, refetch } = useQuery({
    queryKey: ['/api/documents/recent', userData?.id],
    enabled: !!userData,
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="text-red-600 h-5 w-5" />;
      case 'image':
        return <Image className="text-green-600 h-5 w-5" />;
      case 'video':
        return <Video className="text-blue-600 h-5 w-5" />;
      default:
        return <FileText className="text-gray-600 h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Procesado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  return (
    <div data-testid="upload-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subir Archivos</h2>
        <p className="text-gray-600">
          Arrastra y suelta tus archivos o usa la cámara para capturar documentos
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* File Upload Area */}
        <FileUpload />

        {/* Camera Capture */}
        <CameraCapture />
      </div>

      {/* Recent Uploads */}
      <Card className="mt-8" data-testid="recent-uploads-card">
        <CardHeader>
          <CardTitle>Archivos Subidos Recientemente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentUploads && recentUploads.length > 0 ? (
            <div className="space-y-4">
              {recentUploads.map((upload: any) => (
                <div key={upload.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(upload.fileType)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {upload.originalName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(upload.uploadedAt), "dd MMM yyyy, HH:mm", { locale: es })} • {(upload.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getStatusColor(upload.status)}`}>
                      {getStatusText(upload.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(upload.storageUrl, '_blank')}
                      data-testid={`download-${upload.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-${upload.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay archivos subidos recientemente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
