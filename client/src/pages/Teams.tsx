import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TeamForm from "@/components/TeamForm";

export default function Teams() {
  const { user } = useAuth();
  const [showTeamForm, setShowTeamForm] = useState(false);

  const { data: equipas } = useQuery({
    queryKey: ["/api/equipas"],
  });

  const canManageTeams = (user as any)?.tipoUser === "Diretor" || (user as any)?.tipoUser === "Encarregado";

  return (
    <div className="p-4 lg:p-6 mobile-nav-padding">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipas</h2>
          <p className="text-gray-600">
            {canManageTeams 
              ? "Gerencie as equipas das suas obras"
              : "Veja as equipas onde está incluído"
            }
          </p>
        </div>
        {canManageTeams && (
          <Button
            className="bg-construction-500 hover:bg-construction-600"
            onClick={() => setShowTeamForm(true)}
          >
            <i className="fas fa-plus mr-2"></i>
            Nova Equipa
          </Button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipas?.map((equipa: any) => (
          <Card key={equipa.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{equipa.nome}</CardTitle>
                <Badge className="bg-green-100 text-green-800">Ativa</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Obra:</p>
                  <p className="text-sm text-gray-600">{equipa.obra?.nome}</p>
                </div>
                
                {equipa.encarregado && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Encarregado:</p>
                    <p className="text-sm text-gray-600">
                      {equipa.encarregado.firstName} {equipa.encarregado.lastName}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Membros:</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-users mr-2"></i>
                    <span>{equipa.membros?.length || 0} membros</span>
                  </div>
                  
                  {equipa.membros?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {equipa.membros.slice(0, 3).map((membro: any) => (
                        <div key={membro.id} className="text-xs text-gray-600">
                          • {membro.user.firstName} {membro.user.lastName}
                        </div>
                      ))}
                      {equipa.membros.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{equipa.membros.length - 3} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-construction-600 border-construction-200 hover:bg-construction-50"
                  >
                    Ver
                  </Button>
                  {canManageTeams && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {canManageTeams ? "Nenhuma equipa criada" : "Não está em nenhuma equipa"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {canManageTeams 
                    ? "Comece por criar a sua primeira equipa para organizar os trabalhadores"
                    : "Aguarde que um encarregado ou diretor o adicione a uma equipa"
                  }
                </p>
                {canManageTeams && (
                  <Button
                    className="bg-construction-500 hover:bg-construction-600"
                    onClick={() => setShowTeamForm(true)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Criar Primeira Equipa
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Team Form Modal */}
      {showTeamForm && (
        <TeamForm onClose={() => setShowTeamForm(false)} />
      )}
    </div>
  );
}
