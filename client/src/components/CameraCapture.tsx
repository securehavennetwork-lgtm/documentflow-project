import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Circle, StopCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CameraCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setIsActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataURL);
    
    toast({
      title: "Foto capturada",
      description: "La foto se ha capturado exitosamente."
    });
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const savePhoto = async () => {
    if (!capturedImage) return;

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Here you would integrate with the file upload system
      // For now, we'll just show a success message
      toast({
        title: "Foto guardada",
        description: "La foto se ha guardado correctamente."
      });
      
      setCapturedImage(null);
      
    } catch (error) {
      console.error('Error saving photo:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la foto.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, []);

  return (
    <Card data-testid="camera-capture-card">
      <CardHeader>
        <CardTitle>Capturar con Cámara</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Camera Preview */}
        <div className="bg-gray-900 rounded-xl overflow-hidden relative" style={{ aspectRatio: '4/3' }}>
          {isActive && !capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              data-testid="camera-preview"
            />
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
              data-testid="captured-image"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <Camera className="text-gray-400 h-16 w-16 mx-auto mb-4" />
                <p className="text-gray-600">Haz clic para activar la cámara</p>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Camera Controls */}
        <div className="flex space-x-4">
          {!isActive && !capturedImage ? (
            <Button 
              onClick={startCamera} 
              className="flex-1"
              data-testid="start-camera"
            >
              <Camera className="mr-2 h-4 w-4" />
              Activar Cámara
            </Button>
          ) : isActive && !capturedImage ? (
            <>
              <Button 
                onClick={capturePhoto}
                className="flex-1 bg-secondary hover:bg-green-700"
                data-testid="capture-photo"
              >
                <Circle className="mr-2 h-4 w-4" />
                Capturar
              </Button>
              <Button 
                onClick={stopCamera}
                variant="outline"
                data-testid="stop-camera"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Detener
              </Button>
            </>
          ) : capturedImage ? (
            <>
              <Button 
                onClick={retakePhoto}
                variant="outline"
                className="flex-1"
                data-testid="retake-photo"
              >
                Rehacer
              </Button>
              <Button 
                onClick={savePhoto}
                className="flex-1 bg-secondary hover:bg-green-700"
                data-testid="save-photo"
              >
                Guardar
              </Button>
            </>
          ) : null}
        </div>

        {/* Capture Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Lightbulb className="mr-2 h-4 w-4" />
            Consejos para mejor captura
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Asegúrate de tener buena iluminación</li>
            <li>• Mantén el documento plano y completo en el encuadre</li>
            <li>• Evita sombras y reflejos</li>
            <li>• Mantén la cámara estable</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
