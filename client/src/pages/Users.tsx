import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users as UsersIcon, Eye, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const userSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  tipoUser: z.enum(["Trabalhador", "Encarregado", "Diretor"]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<{
    username: string;
    password: string;
    userName: string;
  } | null>(null);
  const [viewCredentials, setViewCredentials] = useState<{
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  } | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{
    username: string;
    newPassword: string;
    firstName: string;
    lastName: string;
    message: string;
  } | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      tipoUser: "Trabalhador",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return await response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      // Store credentials to show to the director
      setNewUserCredentials({
        username: result.credentials.username,
        password: result.credentials.password,
        userName: `${result.user.firstName} ${result.user.lastName}`
      });
      
      toast({
        title: "Utilizador criado",
        description: "O novo utilizador foi criado com sucesso. Veja as credenciais abaixo.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "A reencaminhar para login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível criar o utilizador.",
        variant: "destructive",
      });
    },
  });

  const viewCredentialsMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("GET", `/api/users/${userId}/credentials`);
      return await response.json();
    },
    onSuccess: (result) => {
      setViewCredentials(result);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Não foi possível obter as credenciais do utilizador.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/reset-password`);
      return await response.json();
    },
    onSuccess: (result) => {
      setResetPasswordResult(result);
      toast({
        title: "Senha redefinida",
        description: `Nova senha gerada para ${result.firstName} ${result.lastName}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Não foi possível redefinir a senha do utilizador.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Diretor":
        return "bg-red-100 text-red-800";
      case "Encarregado":
        return "bg-blue-100 text-blue-800";
      case "Trabalhador":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 mobile-nav-padding">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 mobile-nav-padding">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h2>
          <p className="text-gray-600">Gerir trabalhadores, encarregados e diretores</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-construction-500 hover:bg-construction-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Utilizador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Utilizador</DialogTitle>
              <DialogDescription>
                Adicione um novo trabalhador, encarregado ou diretor ao sistema.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do utilizador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Sobrenome do utilizador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Utilizador</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Trabalhador">Trabalhador</SelectItem>
                          <SelectItem value="Encarregado">Encarregado</SelectItem>
                          <SelectItem value="Diretor">Diretor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "A criar..." : "Criar Utilizador"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(users as any[]).map((user: any) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  {user.firstName} {user.lastName}
                </span>
                <Badge className={getRoleColor(user.tipoUser)}>
                  {user.tipoUser}
                </Badge>
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mb-3">
                <p>ID: {user.id}</p>
                {user.createdAt && (
                  <p>Criado: {new Date(user.createdAt).toLocaleDateString('pt-PT')}</p>
                )}
              </div>
              
              {/* Botões para ver credenciais e redefinir senha - apenas para diretores */}
              {currentUser?.tipoUser === "Diretor" && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewCredentialsMutation.mutate(user.id)}
                    disabled={viewCredentialsMutation.isPending}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {viewCredentialsMutation.isPending ? "A carregar..." : "Ver Credenciais"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetPasswordMutation.mutate(user.id)}
                    disabled={resetPasswordMutation.isPending}
                    className="w-full text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {resetPasswordMutation.isPending ? "A redefinir..." : "Redefinir Senha"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(users as any[]).length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum utilizador encontrado
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Comece por criar o primeiro utilizador do sistema.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-construction-500 hover:bg-construction-600"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Primeiro Utilizador
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para mostrar credenciais do novo utilizador */}
      <Dialog open={!!newUserCredentials} onOpenChange={() => setNewUserCredentials(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              Utilizador Criado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center">
              Credenciais para <strong>{newUserCredentials?.userName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {newUserCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-green-800">Usuário:</label>
                    <div className="mt-1 p-2 bg-white rounded border border-green-300 font-mono text-sm">
                      {newUserCredentials.username}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-800">Senha:</label>
                    <div className="mt-1 p-2 bg-white rounded border border-green-300 font-mono text-sm">
                      {newUserCredentials.password}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  <strong>Importante:</strong> Guarde estas credenciais e partilhe-as com o utilizador.
                  Esta é a única vez que a senha será mostrada em texto simples.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => setNewUserCredentials(null)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Entendido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar credenciais existentes (apenas username) */}
      <Dialog open={!!viewCredentials} onOpenChange={() => setViewCredentials(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-600">
              Credenciais do Utilizador
            </DialogTitle>
            <DialogDescription className="text-center">
              Informações de acesso para <strong>{viewCredentials?.firstName} {viewCredentials?.lastName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {viewCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-blue-800">Usuário:</label>
                    <div className="mt-1 p-2 bg-white rounded border border-blue-300 font-mono text-sm">
                      {viewCredentials.username}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-800">Email:</label>
                    <div className="mt-1 p-2 bg-white rounded border border-blue-300 text-sm">
                      {viewCredentials.email}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> {viewCredentials.message}
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => setViewCredentials(null)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar nova senha após redefinição */}
      <Dialog open={!!resetPasswordResult} onOpenChange={() => setResetPasswordResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-orange-600">
              Senha Redefinida com Sucesso
            </DialogTitle>
            <DialogDescription className="text-center">
              Nova senha gerada para <strong>{resetPasswordResult?.firstName} {resetPasswordResult?.lastName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {resetPasswordResult && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-orange-800">Usuário:</label>
                    <div className="mt-1 p-2 bg-white rounded border border-orange-300 font-mono text-sm">
                      {resetPasswordResult.username}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-orange-800">Nova Senha:</label>
                    <div className="mt-1 p-2 bg-white rounded border border-orange-300 font-mono text-sm font-bold text-orange-700">
                      {resetPasswordResult.newPassword}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Anote estas credenciais e partilhe-as com o utilizador. 
                  Esta é a única vez que a senha será exibida em texto claro.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => setResetPasswordResult(null)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Entendido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}