import { useQuery } from "@tanstack/react-query";
import { useDocVisible } from "./useDocVisible";

export function useSmartPolling(fetchFn: () => Promise<any>) {
  const visible = useDocVisible();

  return useQuery({
    queryKey: ["smartPolling"],
    queryFn: fetchFn,
    refetchInterval: visible ? 5000 : false,
  });
}
