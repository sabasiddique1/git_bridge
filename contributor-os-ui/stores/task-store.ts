/**
 * TASK STORE (Zustand)
 * 
 * Client-side state management for tasks.
 * 
 * TODO: Add task filtering and sorting
 * TODO: Implement task persistence
 * TODO: Add task linking to events
 */

import { create } from "zustand"
import type { Task } from "@/types"

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  filter: {
    status?: Task["status"]
    search?: string
  }
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setSelectedTask: (id: string | null) => void
  setFilter: (filter: TaskState["filter"]) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTaskId: null,
  filter: {},

  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),
  
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  
  setSelectedTask: (id) => set({ selectedTaskId: id }),
  
  setFilter: (filter) => set({ filter }),
}))








