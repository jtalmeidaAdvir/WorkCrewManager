import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function UserRoleSelector() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState((user as any)?.tipoUser || "Trabalhador");

  const changeRoleMutation = useMutation({
    mutationFn: async (tipoUser: string) => {
      return await apiRequest("POST", "/api/user/change-role", { tipoUser });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Sucesso",
        description: "Tipo de utilizador alterado com sucesso",
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

  const handleRoleChange = () => {
    if (selectedRole && selectedRole !== (user as any)?.tipoUser) {
      changeRoleMutation.mutate(selectedRole);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "Trabalhador":
        return "Pode registar ponto e criar partes diárias";
      case "Encarregado":
        return "Pode gerir equipas e fazer tudo que o trabalhador faz";
      case "Diretor":
        return "Pode criar obras e gerir todos os aspetos do sistema";
      default:
        return "";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Trabalhador":
        return "bg-blue-100 text-blue-800";
      case "Encarregado":
        return "bg-green-100 text-green-800";
      case "Diretor":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tipo de Utilizador</span>
          <Badge className={getRoleColor((user as any)?.tipoUser || "Trabalhador")}>
            {(user as any)?.tipoUser || "Trabalhador"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Para testar diferentes funcionalidades, pode alterar o seu tipo de utilizador:
            </p>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <Select onValueChange={setSelectedRole} value={selectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trabalhador">Trabalhador</SelectItem>
                    <SelectItem value="Encarregado">Encarregado</SelectItem>
                    <SelectItem value="Diretor">Diretor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleRoleChange}
                disabled={selectedRole === (user as any)?.tipoUser || changeRoleMutation.isPending}
                className="bg-construction-500 hover:bg-construction-600"
              >
                {changeRoleMutation.isPending ? "A alterar..." : "Alterar"}
              </Button>
            </div>
          </div>
          
          {selectedRole && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {selectedRole}:
              </p>
              <p className="text-xs text-gray-600">
                {getRoleDescription(selectedRole)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}