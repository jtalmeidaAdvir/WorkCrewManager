import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import TimeTracking from "@/pages/TimeTracking";
import DailyReports from "@/pages/DailyReports";
import Teams from "@/pages/Teams";
import Projects from "@/pages/Projects";
import Users from "@/pages/Users";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute>
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/ponto" component={TimeTracking} />
          <Route path="/partes" component={DailyReports} />
          <Route path="/equipas" component={Teams} />
          <Route path="/obras" component={Projects} />
          <Route path="/utilizadores" component={Users} />
        </Layout>
      </ProtectedRoute>
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
