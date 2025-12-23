/**
 * TASKS QUERY HOOKS
 * 
 * TanStack Query hooks for tasks.
 * 
 * TODO: Add mutations for create/update/delete
 * TODO: Add optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "@/services/api-service"
import type { Task } from "@/types"

const TASKS_QUERY_KEY = "tasks"

export function useTasks() {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY],
    queryFn: () => tasksApi.list(),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) =>
      tasksApi.create(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      tasksApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
    },
  })
}







