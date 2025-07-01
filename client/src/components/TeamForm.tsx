import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

const teamSchema = z.object({
  nome: z.string().min(1, "Nome da equipa é obrigatório"),
  obraId: z.string().min(1, "Obra é obrigatória"),
  encarregadoId: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
  onClose: () => void;
}

export default function TeamForm({ onClose }: TeamFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { data: obras } = useQuery({
    queryKey: ["/api/obras"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const availableUsers = (users as any[]).filter(u => u.id !== (user as any)?.id);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      nome: "",
      obraId: "",
      encarregadoId: (user as any)?.tipoUser === "Encarregado" ? (user as any).id : "",
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const teamData = {
        ...data,
        obraId: parseInt(data.obraId),
        encarregadoId: data.encarregadoId || (user as any)?.id,
      };
      return await apiRequest("POST", "/api/equipas", teamData);
    },
    onSuccess: async (response) => {
      const team = await response.json();
      
      // Add selected members to the team
      for (const memberId of selectedMembers) {
        try {
          await apiRequest("POST", `/api/equipas/${team.id}/members`, {
            userId: memberId,
          });
        } catch (error) {
          console.error("Error adding member:", error);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/equipas"] });
      onClose();
      form.reset();
      setSelectedMembers([]);
      toast({
        title: "Sucesso",
        description: "Equipa criada com sucesso",
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

  const onSubmit = (data: TeamFormData) => {
    createTeamMutation.mutate(data);
  };

  const handleMemberToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, userId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== userId));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Equipa</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Equipa</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Equipa A - Construção" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                      {(obras as any[])?.map((obra: any) => (
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

            {(user as any)?.tipoUser === "Diretor" && (
              <FormField
                control={form.control}
                name="encarregadoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encarregado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar encarregado..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUsers
                          .filter(u => u.tipoUser === "Encarregado")
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Team Members Selection */}
            <div className="space-y-3">
              <FormLabel>Membros da Equipa</FormLabel>
              <ScrollArea className="h-32 border rounded-md p-3">
                <div className="space-y-2">
                  {availableUsers
                    .filter(u => u.tipoUser === "Trabalhador")
                    .map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={user.id}
                          checked={selectedMembers.includes(user.id)}
                          onCheckedChange={(checked) => 
                            handleMemberToggle(user.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={user.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {user.firstName} {user.lastName}
                        </label>
                      </div>
                    ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-gray-500">
                {selectedMembers.length} membro(s) selecionado(s)
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-construction-500 hover:bg-construction-600"
                disabled={createTeamMutation.isPending}
              >
                {createTeamMutation.isPending ? "A criar..." : "Criar Equipa"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createTeamMutation.isPending}
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
