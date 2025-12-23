/**
 * TanStack Query Client Setup
 * 
 * TODO: Configure query defaults, retry logic, and cache settings
 * TODO: Add React Query Devtools in development
 */

import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})







