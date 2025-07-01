import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const dailyReportSchema = z.object({
  obraId: z.string().min(1, "Obra é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  designacao: z.string().min(1, "Designação é obrigatória"),
  quantidade: z.string().optional(),
  unidade: z.string().optional(),
  especialidade: z.string().optional(),
  horas: z.string().optional(),
  nome: z.string().optional(),
});

type DailyReportFormData = z.infer<typeof dailyReportSchema>;

interface DailyReportFormProps {
  onClose: () => void;
}

export default function DailyReportForm({ onClose }: DailyReportFormProps) {
  const { toast } = useToast();

  const { data: obras } = useQuery({
    queryKey: ["/api/obras"],
  });

  const form = useForm<DailyReportFormData>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      obraId: "",
      data: new Date().toISOString().split('T')[0],
      categoria: "",
      designacao: "",
      quantidade: "",
      unidade: "",
      especialidade: "",
      horas: "",
      nome: "",
    },
  });

  const categoria = form.watch("categoria");

  const createReportMutation = useMutation({
    mutationFn: async (data: DailyReportFormData) => {
      const payload = {
        ...data,
        obraId: parseInt(data.obraId),
        quantidade: data.quantidade ? parseFloat(data.quantidade) : undefined,
        horas: data.horas ? parseFloat(data.horas) : undefined,
      };
      return await apiRequest("POST", "/api/partes-diarias", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partes-diarias"] });
      onClose();
      form.reset();
      toast({
        title: "Sucesso",
        description: "Parte diária registada com sucesso",
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

  const onSubmit = (data: DailyReportFormData) => {
    createReportMutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Parte Diária</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="obraId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obra</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar obra..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {obras?.map((obra: any) => (
                          <SelectItem key={obra.id} value={obra.id.toString()}>
                            {obra.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MaoObra">Mão de Obra</SelectItem>
                      <SelectItem value="Materiais">Materiais</SelectItem>
                      <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {categoria === "MaoObra" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mão de Obra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="especialidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: Pedreiro" {...field} />
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
                          <FormLabel>Nome do Trabalhador</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de Trabalhadores</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="horas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" placeholder="8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {categoria === "Materiais" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Materiais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="unidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Unidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="m³">m³</SelectItem>
                              <SelectItem value="m²">m²</SelectItem>
                              <SelectItem value="m">m</SelectItem>
                              <SelectItem value="un">un</SelectItem>
                              <SelectItem value="l">l</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {categoria === "Equipamentos" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Equipamentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="horas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas de Utilização</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" placeholder="4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name="designacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designação</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        categoria === "MaoObra" ? "ex: Assentamento de tijolo" :
                        categoria === "Materiais" ? "ex: Cimento" :
                        categoria === "Equipamentos" ? "ex: Betoneira" :
                        "Descrição da atividade"
                      } 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-construction-500 hover:bg-construction-600"
                disabled={createReportMutation.isPending}
              >
                {createReportMutation.isPending ? "A submeter..." : "Submeter Parte"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createReportMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
