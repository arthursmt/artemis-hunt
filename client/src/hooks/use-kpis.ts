import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { MOCK_KPIS } from "@/mock/data";

// In a real app, this would fetch from api.kpis.get.path
// For now, we simulate an API delay and return mock data
export function useKpis() {
  return useQuery({
    queryKey: ["/api/kpis"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_KPIS;
    },
  });
}
