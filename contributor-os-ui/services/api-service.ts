/**
 * API SERVICE
 * 
 * Centralized API service layer.
 * All API calls should go through this service.
 * 
 * TODO: Implement actual backend API endpoints
 * TODO: Add authentication headers
 * TODO: Add error handling and retry logic
 * TODO: Add request/response interceptors
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * Generic API fetch wrapper
 * TODO: Add authentication, error handling, retry logic
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // TODO: Add auth token
      // Authorization: `Bearer ${getAuthToken()}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    // TODO: Handle different error types
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Dashboard API
 * TODO: Implement backend endpoint
 */
export const dashboardApi = {
  getStats: async () => {
    // TODO: Replace with actual API call
    // return apiFetch<DashboardStats>('/dashboard/stats')
    return {
      openPRs: 8,
      openIssues: 14,
      pendingTasks: 5,
      needsAction: 3,
      recentActivityCount: 12,
    }
  },
}

/**
 * Events API
 * TODO: Implement backend endpoints
 */
export const eventsApi = {
  list: async (filter?: unknown) => {
    // TODO: Replace with actual API call
    // return apiFetch<AppEvent[]>('/events', {
    //   method: 'POST',
    //   body: JSON.stringify(filter),
    // })
    return []
  },
  getById: async (id: string) => {
    // TODO: Replace with actual API call
    // return apiFetch<AppEvent>(`/events/${id}`)
    throw new Error("Not implemented")
  },
}

/**
 * Tasks API
 * TODO: Implement backend endpoints
 */
export const tasksApi = {
  list: async () => {
    // TODO: Replace with actual API call
    return []
  },
  create: async (task: unknown) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
  update: async (id: string, updates: unknown) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
  delete: async (id: string) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
}

/**
 * Repositories API
 * TODO: Implement backend endpoints
 */
export const reposApi = {
  list: async () => {
    // TODO: Replace with actual API call
    return []
  },
  subscribe: async (repoId: number) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
  unsubscribe: async (repoId: number) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
}

/**
 * Notes API
 * TODO: Implement backend endpoints
 */
export const notesApi = {
  list: async () => {
    // TODO: Replace with actual API call
    return []
  },
  getById: async (id: string) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
  create: async (note: unknown) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
  update: async (id: string, updates: unknown) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
  delete: async (id: string) => {
    // TODO: Replace with actual API call
    throw new Error("Not implemented")
  },
}







