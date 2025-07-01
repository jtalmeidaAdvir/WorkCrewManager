import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-construction-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-hard-hat text-white text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">ConstructPro</CardTitle>
          <CardDescription>
            Sistema de Gestão de Obras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Gerencie equipas, registe pontos e acompanhe o progresso das suas obras de construção.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-clock text-blue-600"></i>
                </div>
                <p className="font-medium text-gray-900">Registo de Ponto</p>
                <p className="text-gray-500">Com GPS e QR Code</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-file-alt text-green-600"></i>
                </div>
                <p className="font-medium text-gray-900">Partes Diárias</p>
                <p className="text-gray-500">Controlo detalhado</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-users text-purple-600"></i>
                </div>
                <p className="font-medium text-gray-900">Gestão de Equipas</p>
                <p className="text-gray-500">Organize trabalhadores</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-construction-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-building text-construction-600"></i>
                </div>
                <p className="font-medium text-gray-900">Gestão de Obras</p>
                <p className="text-gray-500">Controlo total</p>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-construction-500 hover:bg-construction-600"
            onClick={() => window.location.href = "/api/login"}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Iniciar Sessão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
