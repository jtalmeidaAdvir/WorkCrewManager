import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QRScannerProps {
  onClose: () => void;
  onScan?: (obraId: number) => void;
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState("");

  const { data: obras } = useQuery({
    queryKey: ["/api/obras"],
  });

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
          {/* Camera placeholder */}
          <div className="aspect-square bg-black rounded-lg flex items-center justify-center">
            <div className="text-white text-center">
              <i className="fas fa-camera text-4xl mb-2"></i>
              <p className="text-sm">Câmara não disponível</p>
              <p className="text-xs text-gray-300">Insira o código manualmente</p>
            </div>
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
          {obras && obras.length > 0 && (
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
