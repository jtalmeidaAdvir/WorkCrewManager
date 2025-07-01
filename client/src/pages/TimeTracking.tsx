import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import QRScanner from "@/components/QRScanner";

export default function TimeTracking() {
  const { toast } = useToast();
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: todayRegisto, error: todayError } = useQuery({
    queryKey: ["/api/registo-ponto/today"],
  });

  const { data: registos, error: registosError } = useQuery({
    queryKey: ["/api/registo-ponto"],
  });

  const isWorking = todayRegisto && 
    (todayRegisto as any)?.horaEntrada && 
    !(todayRegisto as any)?.horaSaida;

  // Debug logging
  console.log("Today registo:", todayRegisto);
  console.log("All registos:", registos);
  console.log("Today error:", todayError);
  console.log("Registos error:", registosError);
  console.log("Is working:", isWorking);

  const clockInMutation = useMutation({
    mutationFn: async (data: { obraId: number; latitude?: number; longitude?: number }) => {
      return await apiRequest("POST", "/api/registo-ponto/clock-in", data);
    },
    onSuccess: async () => {
      // Immediately invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/registo-ponto/today"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/registo-ponto"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Force refetch after invalidation
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ["/api/registo-ponto/today"] });
        await queryClient.refetchQueries({ queryKey: ["/api/registo-ponto"] });
        await queryClient.refetchQueries({ queryKey: ["/api/stats"] });
      }, 100);
      
      toast({
        title: "Sucesso",
        description: "Ponto de entrada registado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/registo-ponto/clock-out", {});
    },
    onSuccess: async () => {
      // Force refetch with a small delay to ensure database is updated
      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ["/api/registo-ponto/today"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/registo-ponto"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        // Force refetch
        await queryClient.refetchQueries({ queryKey: ["/api/registo-ponto/today"] });
        await queryClient.refetchQueries({ queryKey: ["/api/registo-ponto"] });
      }, 500);
      
      toast({
        title: "Sucesso",
        description: "Ponto de saída registado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClockIn = (obraId: number) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clockInMutation.mutate({
            obraId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          clockInMutation.mutate({ obraId });
        }
      );
    } else {
      clockInMutation.mutate({ obraId });
    }
  };

  return (
    <div className="p-4 lg:p-6 mobile-nav-padding">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Registo de Ponto</h2>
        <p className="text-gray-600">Registe a sua entrada e saída da obra</p>
      </div>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado Atual</CardTitle>
        </CardHeader>
        <CardContent>
          {isWorking ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">A Trabalhar</p>
                  <p className="text-xs text-green-600">
                    Entrada: {(todayRegisto as any)?.horaEntrada}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-800">
                  {(todayRegisto as any)?.horaEntrada && (() => {
                    const now = new Date();
                    const entrada = new Date(`${(todayRegisto as any).data}T${(todayRegisto as any).horaEntrada}`);
                    const elapsed = (now.getTime() - entrada.getTime()) / (1000 * 60 * 60);
                    const hours = Math.floor(elapsed);
                    const minutes = Math.floor((elapsed % 1) * 60);
                    return `${hours}h ${minutes}m`;
                  })()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-clock text-gray-500"></i>
                </div>
                <p className="text-sm font-medium text-gray-600">Não está a trabalhar</p>
                <p className="text-xs text-gray-500">Use o QR code da obra para registar entrada</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <i className="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                <p className="text-xs text-gray-500">Scan QR da Obra</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
              onClick={() => setShowQRScanner(true)}
              disabled={!!isWorking || clockInMutation.isPending}
            >
              <i className="fas fa-qrcode mr-2"></i>
              Scan QR para Entrar
            </Button>
            
            <Button
              className="flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              onClick={() => clockOutMutation.mutate()}
              disabled={!isWorking || clockOutMutation.isPending}
            >
              <i className="fas fa-stop mr-2"></i>
              Registar Saída
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Registos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(registos) && registos.slice(0, 10).map((registo: any) => (
              <div key={registo.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{registo.data}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>
                        <i className="fas fa-sign-in-alt text-green-500 mr-1"></i>
                        {registo.horaEntrada || "---"}
                      </span>
                      <span>
                        <i className="fas fa-sign-out-alt text-red-500 mr-1"></i>
                        {registo.horaSaida || "---"}
                      </span>
                      {registo.totalHorasTrabalhadas && (
                        <span>
                          <i className="fas fa-clock text-blue-500 mr-1"></i>
                          {parseFloat(registo.totalHorasTrabalhadas).toFixed(1)}h
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {registo.horaSaida ? (
                      <Badge className="bg-green-100 text-green-800">Completo</Badge>
                    ) : registo.horaEntrada ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Em curso</Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-clock text-4xl mb-4"></i>
                <p>Nenhum registo de ponto encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner 
          onClose={() => setShowQRScanner(false)}
          onScan={(obraId) => {
            setShowQRScanner(false);
            handleClockIn(obraId);
          }}
        />
      )}
    </div>
  );
}
