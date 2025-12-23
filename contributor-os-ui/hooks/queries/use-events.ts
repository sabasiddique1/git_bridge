/**
 * EVENTS QUERY HOOKS
 * 
 * TanStack Query hooks for fetching and managing events.
 * 
 * TODO: Add pagination support
 * TODO: Add infinite scroll queries
 * TODO: Implement real-time updates via WebSocket
 */

import { useQuery } from "@tanstack/react-query"
import { eventsApi } from "@/services/api-service"
import type { EventFilter } from "@/types/events"

const EVENTS_QUERY_KEY = "events"

export function useEvents(filter?: EventFilter) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, filter],
    queryFn: () => eventsApi.list(filter),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  })
}







