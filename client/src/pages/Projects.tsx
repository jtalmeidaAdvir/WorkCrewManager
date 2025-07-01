import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const projectSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  localizacao: z.string().min(1, "Localização é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showProjectForm, setShowProjectForm] = useState(false);

  const { data: obras } = useQuery({
    queryKey: ["/api/obras"],
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      codigo: "",
      nome: "",
      localizacao: "",
      estado: "Ativa",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      return await apiRequest("POST", "/api/obras", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/obras"] });
      setShowProjectForm(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Obra criada com sucesso",
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

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const canManageProjects = user?.tipoUser === "Diretor";

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Ativa":
        return "bg-green-100 text-green-800";
      case "Pausada":
        return "bg-yellow-100 text-yellow-800";
      case "Concluida":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 lg:p-6 mobile-nav-padding">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Obras</h2>
          <p className="text-gray-600">
            {canManageProjects 
              ? "Gerencie as obras da empresa"
              : "Veja as obras disponíveis"
            }
          </p>
        </div>
        {canManageProjects && (
          <Button
            className="bg-construction-500 hover:bg-construction-600"
            onClick={() => setShowProjectForm(true)}
          >
            <i className="fas fa-plus mr-2"></i>
            Nova Obra
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {obras?.map((obra: any) => (
          <Card key={obra.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{obra.nome}</CardTitle>
                <Badge className={getStatusColor(obra.estado)}>
                  {obra.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Código:</p>
                  <p className="text-sm text-gray-600">{obra.codigo}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Localização:</p>
                  <p className="text-sm text-gray-600">{obra.localizacao}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">QR Code:</p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                      <i className="fas fa-qrcode text-2xl text-gray-400"></i>
                    </div>
                    <p className="text-xs text-gray-500 font-mono break-all">
                      {obra.qrCode}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-construction-600 border-construction-200 hover:bg-construction-50"
                  >
                    <i className="fas fa-eye mr-1"></i>
                    Ver
                  </Button>
                  {canManageProjects && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <i className="fas fa-edit mr-1"></i>
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
                <i className="fas fa-building text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {canManageProjects ? "Nenhuma obra registada" : "Nenhuma obra disponível"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {canManageProjects 
                    ? "Comece por registar a sua primeira obra"
                    : "Aguarde que obras sejam criadas pelo diretor"
                  }
                </p>
                {canManageProjects && (
                  <Button
                    className="bg-construction-500 hover:bg-construction-600"
                    onClick={() => setShowProjectForm(true)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Primeira Obra
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Project Form Dialog */}
      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Obra</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: OBR001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Central Plaza" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="localizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Porto, Portugal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativa">Ativa</SelectItem>
                        <SelectItem value="Pausada">Pausada</SelectItem>
                        <SelectItem value="Concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-construction-500 hover:bg-construction-600"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "A criar..." : "Criar Obra"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProjectForm(false)}
                  disabled={createProjectMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
