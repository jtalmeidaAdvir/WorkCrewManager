import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DailyReportForm from "@/components/DailyReportForm";

export default function DailyReports() {
  const [showReportForm, setShowReportForm] = useState(false);

  const { data: partes } = useQuery({
    queryKey: ["/api/partes-diarias"],
  });

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "MaoObra":
        return "bg-blue-100 text-blue-800";
      case "Materiais":
        return "bg-green-100 text-green-800";
      case "Equipamentos":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case "MaoObra":
        return "Mão de Obra";
      case "Materiais":
        return "Materiais";
      case "Equipamentos":
        return "Equipamentos";
      default:
        return categoria;
    }
  };

  return (
    <div className="p-4 lg:p-6 mobile-nav-padding">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partes Diárias</h2>
          <p className="text-gray-600">Registe as atividades diárias da obra</p>
        </div>
        <Button
          className="bg-construction-500 hover:bg-construction-600"
          onClick={() => setShowReportForm(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Nova Parte
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Mão de Obra</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {partes?.filter((p: any) => p.categoria === "MaoObra").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-boxes text-green-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Materiais</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {partes?.filter((p: any) => p.categoria === "Materiais").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-tools text-purple-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Equipamentos</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {partes?.filter((p: any) => p.categoria === "Equipamentos").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Partes Registadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partes?.map((parte: any) => (
              <div key={parte.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{parte.obra?.nome}</h4>
                      <Badge className={getCategoryColor(parte.categoria)}>
                        {getCategoryLabel(parte.categoria)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <i className="fas fa-calendar mr-1"></i>
                      {parte.data}
                    </p>
                    
                    <div className="space-y-1 text-sm">
                      <p><strong>Designação:</strong> {parte.designacao}</p>
                      
                      {parte.especialidade && (
                        <p><strong>Especialidade:</strong> {parte.especialidade}</p>
                      )}
                      
                      {parte.quantidade && (
                        <p>
                          <strong>Quantidade:</strong> {parte.quantidade}
                          {parte.unidade && ` ${parte.unidade}`}
                        </p>
                      )}
                      
                      {parte.horas && (
                        <p><strong>Horas:</strong> {parte.horas}h</p>
                      )}
                      
                      {parte.nome && (
                        <p><strong>Trabalhador:</strong> {parte.nome}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      Registada
                    </Badge>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-12">
                <i className="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma parte diária registada
                </h3>
                <p className="text-gray-500 mb-6">
                  Comece por registar as atividades da sua obra
                </p>
                <Button
                  className="bg-construction-500 hover:bg-construction-600"
                  onClick={() => setShowReportForm(true)}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Primeira Parte Diária
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Report Form Modal */}
      {showReportForm && (
        <DailyReportForm onClose={() => setShowReportForm(false)} />
      )}
    </div>
  );
}
