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
    const params = new URLSearchParams()
    
    if (filter && typeof filter === "object") {
      const f = filter as any
      if (f.types?.length) params.append("types", f.types.join(","))
      if (f.sources?.length) params.append("sources", f.sources.join(","))
      if (f.repositories?.length) params.append("repositories", f.repositories.join(","))
      if (f.languages?.length) params.append("languages", f.languages.join(","))
      if (f.needsAction) params.append("needsAction", "true")
    }

    const response = await fetch(`/api/events?${params.toString()}`, {
      credentials: "include", // Include cookies for authentication
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch events")
    }
    
    return response.json()
  },
  getById: async (id: string) => {
    // TODO: Replace with actual API call
    // return apiFetch<AppEvent>(`/events/${id}`)
    throw new Error("Not implemented")
  },
}

/**
 * Tasks API
 * Fetches tasks from user's open source PRs
 */
export const tasksApi = {
  list: async () => {
    console.log("[Tasks API] Fetching tasks from /api/tasks")
    const response = await fetch("/api/tasks", {
      credentials: "include", // Include cookies for authentication
    })
    console.log("[Tasks API] Response status:", response.status, response.statusText)
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error("[Tasks API] Error response:", errorText)
      throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`)
    }
    const data = await response.json()
    console.log("[Tasks API] Received tasks:", data.length || 0, "tasks")
    return data || []
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







