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
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect if user is on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const { data: obras } = useQuery({
    queryKey: ["/api/obras"],
  });

  // Camera functionality
  const startCamera = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      setIsLoading(true);
      setCameraError("");
      
      // Check if we're on HTTPS (required for camera on mobile)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        setCameraError("A câmera requer HTTPS. Por favor, use a versão segura do site.");
        setIsLoading(false);
        return;
      }
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("API da câmera não suportada neste navegador.");
        return;
      }
      
      console.log("Requesting camera permission...");
      
      // Try different camera configurations with simpler constraints for mobile
      let stream: MediaStream | null = null;
      
      try {
        // Try back camera first with basic constraints
        console.log("Trying back camera...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { exact: "environment" }
          }
        });
        console.log("Back camera success!");
      } catch (backCameraError) {
        console.log("Back camera failed:", backCameraError);
        try {
          // Fall back to front camera
          console.log("Trying front camera...");
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: "user"
            }
          });
          console.log("Front camera success!");
        } catch (frontCameraError) {
          console.log("Front camera failed:", frontCameraError);
          try {
            // Fall back to any available camera with basic constraints
            console.log("Trying any camera...");
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { min: 320, ideal: 640, max: 1920 },
                height: { min: 240, ideal: 480, max: 1080 }
              }
            });
            console.log("Any camera success!");
          } catch (anyCameraError) {
            console.log("Any camera failed:", anyCameraError);
            // Last resort - simplest possible constraint
            stream = await navigator.mediaDevices.getUserMedia({
              video: true
            });
            console.log("Simple camera constraint success!");
          }
        }
      }
      
      if (!stream) {
        console.error("No stream obtained");
        setCameraError("Não foi possível obter acesso à câmera.");
        return;
      }
      
      if (!videoRef.current) {
        console.error("Video element not available");
        setCameraError("Elemento de vídeo não disponível.");
        return;
      }
      
      console.log("Setting up video stream...");
      console.log("Stream tracks:", stream.getTracks().map(track => ({
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState
      })));
      
      try {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Ensure autoplay works on mobile
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        
        // Wait for video to be ready and play
        const playVideo = async () => {
          try {
            if (videoRef.current && streamRef.current) {
              console.log("Attempting to play video...");
              await videoRef.current.play();
              setCameraActive(true);
              console.log("Video playing successfully");
              
              toast({
                title: "Câmera ativada",
                description: "A câmera está agora ativa. Aponte para o código QR.",
              });
            }
          } catch (playError: any) {
            console.error("Video play error:", playError);
            setCameraError(`Erro ao reproduzir vídeo: ${playError?.message || 'Erro desconhecido'}`);
          }
        };
        
        // Set up event listeners
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          playVideo();
        };
        
        videoRef.current.onerror = (error) => {
          console.error("Video error:", error);
          setCameraError("Erro no elemento de vídeo.");
        };
        
        // Fallback: try to play immediately if metadata is already loaded
        if (videoRef.current.readyState >= 1) {
          console.log("Video already ready, playing immediately");
          playVideo();
        }
        
        // Additional fallback after a short delay
        setTimeout(() => {
          if (!cameraActive && videoRef.current && streamRef.current) {
            console.log("Fallback: trying to play video after delay");
            playVideo();
          }
        }, 1000);
        
      } catch (setupError: any) {
        console.error("Stream setup error:", setupError);
        setCameraError(`Erro ao configurar stream: ${setupError?.message || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      let errorMessage = "Não foi possível aceder à câmera.";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "Permissão da câmera negada. Toque em 'Permitir' quando solicitado.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "Nenhuma câmera encontrada no dispositivo.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Câmera não suportada neste navegador.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Câmera em uso por outra aplicação.";
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Configuração de câmera não suportada.";
      } else {
        errorMessage = `Erro da câmera: ${error.message || error.name || 'Erro desconhecido'}`;
      }
      
      setCameraError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
    }
    
    setCameraActive(false);
    setCameraError("");
    setIsLoading(false);
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
                  webkit-playsinline="true"
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
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
                  className="text-white border-white hover:bg-white hover:text-black active:bg-gray-200 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      A ativar...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Ativar Câmera
                    </>
                  )}
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
