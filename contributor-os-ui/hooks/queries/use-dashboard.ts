/**
 * DASHBOARD QUERY HOOKS
 * 
 * TanStack Query hooks for dashboard data.
 * 
 * TODO: Add real-time updates for dashboard stats
 * TODO: Add caching strategies
 */

import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/services/api-service"

const DASHBOARD_QUERY_KEY = "dashboard"

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, "stats"],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}







