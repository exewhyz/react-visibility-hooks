import { useDocVisible } from "./useDocVisible";

let useQuery: any;

try {
  useQuery = require("@tanstack/react-query").useQuery;
} catch {
  useQuery = null;
}

export function useSmartPolling(fetchFn: () => Promise<any>) {
  const visible = useDocVisible();

  if (!useQuery) {
    console.warn(
      "Install @tanstack/react-query to use useSmartPolling hook"
    );
    return null;
  }

  return useQuery({
    queryKey: ["smartPolling"],
    queryFn: fetchFn,
    refetchInterval: visible ? 5000 : false,
  });
}
