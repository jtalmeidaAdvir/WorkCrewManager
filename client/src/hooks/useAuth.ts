import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn } from "../lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | undefined>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}