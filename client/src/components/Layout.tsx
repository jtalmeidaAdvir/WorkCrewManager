import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import MobileNavigation from "@/components/MobileNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: "fas fa-home", roles: ["Trabalhador", "Diretor", "Encarregado"] },
    { name: "Registo de Ponto", href: "/ponto", icon: "fas fa-clock", roles: ["Trabalhador", "Diretor", "Encarregado"] },
    { name: "Partes Diárias", href: "/partes", icon: "fas fa-file-alt", roles: ["Trabalhador", "Diretor", "Encarregado"] },
    { name: "Equipas", href: "/equipas", icon: "fas fa-users", roles: ["Diretor", "Encarregado"] },
    { name: "Obras", href: "/obras", icon: "fas fa-building", roles: ["Diretor"] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.tipoUser || "Trabalhador")
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-construction-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-hard-hat text-white text-sm"></i>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">ConstructPro</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="fas fa-bars text-xl"></i>
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-slate-custom-800">
          <div className="flex h-16 flex-shrink-0 items-center bg-slate-custom-700 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-construction-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-hard-hat text-white text-sm"></i>
              </div>
              <h1 className="text-lg font-semibold text-white">ConstructPro</h1>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={`${
                  location === item.href
                    ? "bg-slate-custom-700 text-white"
                    : "text-gray-300 hover:bg-slate-custom-700 hover:text-white"
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
              >
                <i className={`${item.icon} mr-3 h-4 w-4`}></i>
                {item.name}
              </button>
            ))}
          </nav>
          
          {/* User Profile Section */}
          <div className="flex-shrink-0 border-t border-slate-custom-600 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-construction-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName || user?.email}
                </p>
                <p className="text-xs text-gray-400">{user?.tipoUser}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-gray-300 hover:text-white hover:bg-slate-custom-700"
              onClick={() => window.location.href = "/api/logout"}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-custom-800">
            <div className="flex h-16 items-center justify-between bg-slate-custom-700 px-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-construction-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-hard-hat text-white text-sm"></i>
                </div>
                <h1 className="text-lg font-semibold text-white">ConstructPro</h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
            
            <nav className="flex-1 space-y-1 px-2 py-4">
              {filteredNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setLocation(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`${
                    location === item.href
                      ? "bg-slate-custom-700 text-white"
                      : "text-gray-300 hover:bg-slate-custom-700 hover:text-white"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
                >
                  <i className={`${item.icon} mr-3 h-4 w-4`}></i>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
