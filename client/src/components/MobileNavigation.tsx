import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function MobileNavigation() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    { 
      name: "Início", 
      href: "/", 
      icon: "fas fa-home", 
      roles: ["Trabalhador", "Diretor", "Encarregado"] 
    },
    { 
      name: "Ponto", 
      href: "/ponto", 
      icon: "fas fa-clock", 
      roles: ["Trabalhador", "Diretor", "Encarregado"] 
    },
    { 
      name: "Partes", 
      href: "/partes", 
      icon: "fas fa-file-alt", 
      roles: ["Trabalhador", "Diretor", "Encarregado"] 
    },
    { 
      name: "Equipas", 
      href: "/equipas", 
      icon: "fas fa-users", 
      roles: ["Diretor", "Encarregado"] 
    },
    { 
      name: "Obras", 
      href: "/obras", 
      icon: "fas fa-building", 
      roles: ["Diretor"] 
    },
    { 
      name: "Utilizadores", 
      href: "/utilizadores", 
      icon: "fas fa-user-plus", 
      roles: ["Diretor"] 
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes((user as any)?.tipoUser || "Trabalhador")
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        {filteredNavigation.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center py-2 px-3 min-w-0 ${
              location === item.href
                ? "text-construction-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => setLocation(item.href)}
          >
            <i className={`${item.icon} text-lg mb-1`}></i>
            <span className="text-xs truncate">{item.name}</span>
          </Button>
        ))}
        
        {/* Profile/Logout button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-gray-600"
          onClick={() => window.location.href = "/api/logout"}
        >
          <i className="fas fa-sign-out-alt text-lg mb-1"></i>
          <span className="text-xs">Sair</span>
        </Button>
      </div>
    </nav>
  );
}
