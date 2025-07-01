import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import TimeTracking from "@/pages/TimeTracking";
import DailyReports from "@/pages/DailyReports";
import Teams from "@/pages/Teams";
import Projects from "@/pages/Projects";
import Users from "@/pages/Users";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-construction-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <i className="fas fa-hard-hat text-white text-sm"></i>
          </div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/ponto" component={TimeTracking} />
          <Route path="/partes" component={DailyReports} />
          <Route path="/equipas" component={Teams} />
          <Route path="/obras" component={Projects} />
          <Route path="/utilizadores" component={Users} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
