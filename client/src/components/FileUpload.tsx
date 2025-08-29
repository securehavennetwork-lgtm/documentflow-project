import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudUpload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/png': 'image', 
  'image/gif': 'image',
  'video/mp4': 'video',
  'video/quicktime': 'video'
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userData } = useAuth();
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
      toast({
        title: "Tipo de archivo no permitido",
        description: `El archivo ${file.name} no es de un tipo permitido.`,
        variant: "destructive"
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo demasiado grande",
        description: `El archivo ${file.name} excede el tamaño máximo de 50MB.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(validateFile);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const uploadFiles = async () => {
    if (!userData || selectedFiles.length === 0 || !documentType) {
      toast({
        title: "Error",
        description: "Por favor selecciona archivos y tipo de documento.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userData.id);
        formData.append('documentType', documentType);
        formData.append('originalName', file.name);

        // Upload file via API
        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to upload ${file.name}`);
        }

        // Update progress
        setUploadProgress(((index + 1) / selectedFiles.length) * 100);
        
        return response.json();
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Éxito",
        description: `${selectedFiles.length} archivo(s) subidos correctamente.`,
      });

      // Reset form
      setSelectedFiles([]);
      setDocumentType("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error de subida",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card data-testid="file-upload-card">
      <CardHeader>
        <CardTitle>Subir desde Dispositivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragOver ? 'border-primary bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          data-testid="drop-zone"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CloudUpload className="text-gray-400 h-8 w-8" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Arrastra tus archivos aquí
          </h4>
          <p className="text-gray-600 mb-4">o haz clic para seleccionar</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            data-testid="file-input"
          />
          <Button type="button" data-testid="select-files-button">
            Seleccionar Archivos
          </Button>
          <div className="mt-4 text-xs text-gray-500">
            Formatos: PDF, JPG, PNG, GIF, MP4 • Tamaño máximo: 50MB
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Archivos Seleccionados:</Label>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium truncate">{file.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    data-testid={`remove-file-${index}`}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Type Selection */}
        <div>
          <Label>Tipo de Documento</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger data-testid="document-type-select">
              <SelectValue placeholder="Seleccionar tipo..." />
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

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Subiendo archivos...
              </span>
              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" data-testid="upload-progress" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={uploadFiles}
          disabled={selectedFiles.length === 0 || !documentType || uploading}
          className="w-full"
          data-testid="upload-button"
        >
          {uploading ? "Subiendo..." : `Subir ${selectedFiles.length} archivo(s)`}
        </Button>
      </CardContent>
    </Card>
  );
}