/**
 * REPOSITORIES QUERY HOOKS
 * 
 * TanStack Query hooks for repositories.
 * 
 * TODO: Add mutations for subscribe/unsubscribe
 * TODO: Add repository search
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reposApi } from "@/services/api-service"

const REPOS_QUERY_KEY = "repos"

export function useRepos() {
  return useQuery({
    queryKey: [REPOS_QUERY_KEY],
    queryFn: () => reposApi.list(),
  })
}

export function useSubscribeRepo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (repoId: number) => reposApi.subscribe(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPOS_QUERY_KEY] })
    },
  })
}

export function useUnsubscribeRepo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (repoId: number) => reposApi.unsubscribe(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPOS_QUERY_KEY] })
    },
  })
}







