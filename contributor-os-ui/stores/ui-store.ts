/**
 * UI STORE (Zustand)
 * 
 * Client-side state for UI preferences and interactions.
 * 
 * TODO: Persist UI preferences to localStorage
 * TODO: Add theme preferences
 * TODO: Add sidebar collapse state
 */

import { create } from "zustand"

interface UIState {
  notificationsOpen: boolean
  sidebarCollapsed: boolean
  activeView: string
  
  // Actions
  setNotificationsOpen: (open: boolean) => void
  toggleNotifications: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setActiveView: (view: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  notificationsOpen: false,
  sidebarCollapsed: false,
  activeView: "timeline",

  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  
  toggleNotifications: () =>
    set((state) => ({ notificationsOpen: !state.notificationsOpen })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setActiveView: (view) => set({ activeView: view }),
}))








