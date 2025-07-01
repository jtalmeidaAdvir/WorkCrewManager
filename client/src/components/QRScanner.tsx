import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, CameraOff } from "lucide-react";

interface QRScannerProps {
  onClose: () => void;
  onScan?: (obraId: number) => void;
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: obras } = useQuery({
    queryKey: ["/api/obras"],
  });

  // Camera functionality
  const startCamera = async () => {
    try {
      setCameraError("");
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported");
      }
      
      // Try different camera configurations
      let stream: MediaStream | null = null;
      
      try {
        // Try back camera first
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (backCameraError) {
        console.log("Back camera failed, trying front camera");
        try {
          // Fall back to front camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        } catch (frontCameraError) {
          console.log("Front camera failed, trying any camera");
          // Fall back to any available camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
      }
      
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setCameraActive(true);
          }
        };
      }
    } catch (error: any) {
      let errorMessage = "Não foi possível aceder à câmera.";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "Permissão da câmera negada. Por favor, permita o acesso à câmera.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "Nenhuma câmera encontrada no dispositivo.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Câmera não suportada neste navegador.";
      }
      
      setCameraError(errorMessage);
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Simple QR detection (basic implementation)
  const captureFrame = () => {
    if (!videoRef.current || !cameraActive) return;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      // In a real implementation, you would use a QR code library here
      // For now, we'll show a message to use manual input
      toast({
        title: "Dica",
        description: "Use a entrada manual para inserir o código QR",
      });
    }
  };

  const scanMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await apiRequest("GET", `/api/obras/qr/${qrCode}`);
      return await response.json();
    },
    onSuccess: (obra) => {
      toast({
        title: "QR Code válido",
        description: `Obra: ${obra.nome}`,
      });
      if (onScan) {
        onScan(obra.id);
      }
      onClose();
    },
    onError: (error) => {
      toast({
        title: "QR Code inválido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = () => {
    if (!qrCode.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o código QR",
        variant: "destructive",
      });
      return;
    }
    scanMutation.mutate(qrCode.trim());
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan QR Code da Obra</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Camera */}
          <div className="aspect-square bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white border-dashed"></div>
                </div>
                <Button
                  onClick={captureFrame}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black hover:bg-gray-200"
                  size="sm"
                >
                  Capturar
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-black/50 text-white border-white"
                >
                  <CameraOff className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="text-white text-center">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm mb-2">Câmera</p>
                {cameraError && (
                  <p className="text-xs text-red-300 mb-2">{cameraError}</p>
                )}
                <Button
                  onClick={startCamera}
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Ativar Câmera
                </Button>
              </div>
            )}
          </div>
          
          {/* Manual input */}
          <div className="space-y-2">
            <Label htmlFor="qrCode">Código QR</Label>
            <Input
              id="qrCode"
              placeholder="Cole o código QR aqui"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
            />
          </div>
          
          {/* Quick select from available obras */}
          {Array.isArray(obras) && obras.length > 0 && (
            <div className="space-y-2">
              <Label>Ou selecione uma obra:</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {obras.map((obra: any) => (
                  <Button
                    key={obra.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => setQrCode(obra.qrCode)}
                  >
                    <div>
                      <p className="font-medium">{obra.nome}</p>
                      <p className="text-xs text-gray-500">{obra.codigo}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button
              className="w-full bg-construction-500 hover:bg-construction-600"
              onClick={handleScan}
              disabled={scanMutation.isPending}
            >
              {scanMutation.isPending ? "A verificar..." : "Verificar QR Code"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={scanMutation.isPending}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
