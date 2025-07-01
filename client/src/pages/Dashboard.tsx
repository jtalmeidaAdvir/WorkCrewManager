import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Building, Users } from "lucide-react";
import { Link } from "wouter";
import QRScanner from "@/components/QRScanner";
import DailyReportForm from "@/components/DailyReportForm";
import UserRoleSelector from "@/components/UserRoleSelector";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showDailyReportForm, setShowDailyReportForm] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: todayRegisto } = useQuery({
    queryKey: ["/api/registo-ponto/today"],
  });

  const { data: recentPartes } = useQuery({
    queryKey: ["/api/partes-diarias"],
  });

  const isWorking = todayRegisto?.horaEntrada && !todayRegisto?.horaSaida;

  return (
    <div className="p-4 lg:p-6 mobile-nav-padding">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">
          Bem-vindo de volta, {user?.firstName || user?.email}
        </p>
      </div>

      {/* User Role Selector for Testing */}
      <UserRoleSelector />

      {/* Quick Actions for Directors */}
      {(user as any)?.tipoUser === "Diretor" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ações Rápidas - Gestão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/utilizadores">
                <Button className="w-full flex items-center justify-center gap-2 bg-construction-500 hover:bg-construction-600">
                  <UserPlus className="w-4 h-4" />
                  Gerir Utilizadores
                </Button>
              </Link>
              <Link href="/obras">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  Gerir Obras
                </Button>
              </Link>
              <Link href="/equipas">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Gerir Equipas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-dashed border-gray-300 hover:border-construction-500 hover:bg-construction-50"
              onClick={() => setShowQRScanner(true)}
            >
              <i className="fas fa-qrcode text-2xl text-construction-500 mb-2"></i>
              <span className="text-sm font-medium text-gray-700">Scan QR</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50"
              disabled={isWorking}
            >
              <i className="fas fa-clock text-2xl text-green-500 mb-2"></i>
              <span className="text-sm font-medium text-gray-700">Entrar</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50"
              disabled={!isWorking}
            >
              <i className="fas fa-sign-out-alt text-2xl text-red-500 mb-2"></i>
              <span className="text-sm font-medium text-gray-700">Sair</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              onClick={() => setShowDailyReportForm(true)}
            >
              <i className="fas fa-plus text-2xl text-blue-500 mb-2"></i>
              <span className="text-sm font-medium text-gray-700">Nova Parte</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Horas Hoje</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.hoursToday?.toFixed(1) || 0}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-week text-green-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Horas Semana</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.hoursWeek?.toFixed(1) || 0}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-construction-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-building text-construction-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Obras Ativas</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.activeProjects || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-purple-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Equipa</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.teamMembers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Atual</CardTitle>
          </CardHeader>
          <CardContent>
            {isWorking ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Trabalhando</p>
                    <p className="text-xs text-green-600">
                      Entrada: {todayRegisto?.horaEntrada}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-800">
                    {/* Calculate elapsed time */}
                    {todayRegisto?.horaEntrada && (() => {
                      const now = new Date();
                      const entrada = new Date(`${todayRegisto.data}T${todayRegisto.horaEntrada}`);
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
                  <p className="text-xs text-gray-500">Registe o seu ponto para começar</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity - Placeholder for now */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayRegisto?.horaEntrada && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-blue-600 text-xs"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Registou ponto de entrada</p>
                    <p className="text-xs text-gray-500">
                      Hoje • {todayRegisto.horaEntrada}
                    </p>
                  </div>
                </div>
              )}
              
              {!todayRegisto?.horaEntrada && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-history text-2xl mb-2"></i>
                  <p className="text-sm">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Reports Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Partes Diárias Recentes</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-construction-500 hover:text-construction-600"
          >
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPartes?.slice(0, 3).map((parte: any) => (
              <div key={parte.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{parte.obra?.nome}</h4>
                    <p className="text-sm text-gray-600 mt-1">{parte.data}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {parte.categoria}: {parte.designacao}
                      </Badge>
                      {parte.quantidade && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Qtd: {parte.quantidade} {parte.unidade}
                        </Badge>
                      )}
                      {parte.horas && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {parte.horas}h
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Submetida
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <i className="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 mb-4">Nenhuma parte diária registada</p>
                <Button
                  variant="outline"
                  className="border-construction-500 text-construction-500 hover:bg-construction-50"
                  onClick={() => setShowDailyReportForm(true)}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Nova Parte Diária
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showQRScanner && (
        <QRScanner onClose={() => setShowQRScanner(false)} />
      )}

      {showDailyReportForm && (
        <DailyReportForm onClose={() => setShowDailyReportForm(false)} />
      )}
    </div>
  );
}
