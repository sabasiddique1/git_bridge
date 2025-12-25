/**
 * EVENT STORE (Zustand)
 * 
 * Client-side state management for events.
 * This store manages the event stream and filters.
 * 
 * TODO: Add event caching and pagination
 * TODO: Implement optimistic updates
 * TODO: Add event deduplication logic
 */

import { create } from "zustand"
import type { AppEvent, EventFilter } from "@/types/events"

interface EventState {
  events: AppEvent[]
  filter: EventFilter
  isLoading: boolean
  error: Error | null
  
  // Actions
  setEvents: (events: AppEvent[]) => void
  addEvent: (event: AppEvent) => void
  setFilter: (filter: EventFilter) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  clearEvents: () => void
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  filter: {},
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),
  
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 100), // Keep last 100 events
    })),
  
  setFilter: (filter) => set({ filter }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearEvents: () => set({ events: [] }),
}))








