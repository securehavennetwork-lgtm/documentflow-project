import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Video, Eye, Download, Trash2 } from "lucide-react";
import { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="text-red-500 h-8 w-8" />;
      case 'image':
        return <Image className="text-green-500 h-8 w-8" />;
      case 'video':
        return <Video className="text-blue-500 h-8 w-8" />;
      default:
        return <FileText className="text-gray-500 h-8 w-8" />;
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

  const getDocumentTypeText = (type: string) => {
    const types = {
      'identification': 'Identificación Oficial',
      'address_proof': 'Comprobante de Domicilio',
      'education_certificate': 'Certificado de Estudios',
      'work_contract': 'Contrato de Trabajo',
      'rfc': 'RFC',
      'curp': 'CURP',
      'other': 'Otros'
    };
    return types[type as keyof typeof types] || type;
  };

  const handleView = () => {
    if (document.storageUrl) {
      window.open(document.storageUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No se puede abrir el documento.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async () => {
    if (!document.storageUrl) {
      toast({
        title: "Error",
        description: "No se puede descargar el documento.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(document.storageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = document.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: "El archivo se está descargando."
      });
    } catch (error) {
      toast({
        title: "Error de descarga",
        description: "No se pudo descargar el archivo.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document.id);
    }
  };

  return (
    <Card className="overflow-hidden" data-testid={`document-card-${document.id}`}>
      {/* Document Preview */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {getFileIcon(document.fileType)}
      </div>
      
      {/* Document Info */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-sm truncate flex-1" title={document.originalName}>
            {document.originalName}
          </h3>
          <Badge className={`ml-2 text-xs ${getStatusColor(document.status)}`}>
            {getStatusText(document.status)}
          </Badge>
        </div>
        
        <p className="text-xs text-gray-600 mb-2">
          {getDocumentTypeText(document.documentType)}
        </p>
        
        <p className="text-xs text-gray-500 mb-3">
          Subido: {format(new Date(document.uploadedAt), "dd MMM yyyy, HH:mm", { locale: es })}
        </p>
        
        <p className="text-xs text-gray-500 mb-3">
          Tamaño: {(document.fileSize / (1024 * 1024)).toFixed(1)} MB
        </p>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={handleView}
            data-testid="view-document"
          >
            <Eye className="mr-1 h-3 w-3" />
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={handleDownload}
            data-testid="download-document"
          >
            <Download className="mr-1 h-3 w-3" />
            Descargar
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-700 hover:bg-red-50 text-xs"
              onClick={handleDelete}
              data-testid="delete-document"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
