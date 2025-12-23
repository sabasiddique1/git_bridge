"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Star, GitFork, ExternalLink, Pin, MoreHorizontal, Filter, Loader2, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRepos } from "@/hooks/queries/use-repos"

interface Repository {
  id: number
  name: string
  fullName: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  url: string
  license: string | null
  owner: string
  ownerType: string
  ownerAvatar: string
  topics: string[]
  createdAt: string
  updatedAt: string
  pushedAt: string
}

// Language colors mapping
const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  CSS: "bg-purple-500",
  Rust: "bg-orange-500",
  Python: "bg-blue-600",
  Java: "bg-orange-600",
  Go: "bg-cyan-500",
  HTML: "bg-orange-500",
  Shell: "bg-gray-500",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-600",
  PHP: "bg-indigo-500",
  Ruby: "bg-red-500",
  C: "bg-gray-600",
  "C++": "bg-blue-700",
  CSharp: "bg-purple-700",
  Vue: "bg-green-500",
  Dart: "bg-blue-400",
}

// Format number for display (e.g., 1234 -> "1.2k")
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k"
  }
  return num.toString()
}

// Format date relative to now
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? "s" : ""} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? "s" : ""} ago`
}

export function ReposView() {
  const [search, setSearch] = useState("")
  const [languageFilter, setLanguageFilter] = useState<string[]>([])
  
  const { data: repos = [], isLoading, error } = useRepos()

  // Get unique languages from repos
  const languages = useMemo(() => {
    const langs = new Set<string>()
    repos.forEach((repo: Repository) => {
      if (repo.language) langs.add(repo.language)
    })
    return Array.from(langs).sort()
  }, [repos])

  // Filter repos
  const filteredRepos = useMemo(() => {
    return repos.filter((repo: Repository) => {
      const matchesSearch = repo.fullName.toLowerCase().includes(search.toLowerCase()) ||
                           (repo.description || "").toLowerCase().includes(search.toLowerCase())
      const matchesLanguage = languageFilter.length === 0 || 
                             (repo.language && languageFilter.includes(repo.language))
      return matchesSearch && matchesLanguage
    })
  }, [repos, search, languageFilter])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <span className="text-muted-foreground">Loading your open source repositories...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-destructive">Failed to load repositories. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Repositories</h2>
          <p className="text-sm text-muted-foreground">
            {filteredRepos.length} {filteredRepos.length === 1 ? "repository" : "repositories"}
            {search || languageFilter.length > 0 ? ` (filtered from ${repos.length} total)` : ` from open source projects`}
          </p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Track Repository
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Language
              {languageFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {languageFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            {languages.length > 0 ? (
              languages.map((lang) => (
                <DropdownMenuCheckboxItem
                  key={lang}
                  checked={languageFilter.includes(lang)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLanguageFilter([...languageFilter, lang])
                    } else {
                      setLanguageFilter(languageFilter.filter((l) => l !== lang))
                    }
                  }}
                >
                  <span className={cn("mr-2 h-2 w-2 rounded-full", languageColors[lang] || "bg-gray-500")} />
                  {lang}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No languages found</DropdownMenuItem>
            )}
            {languageFilter.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLanguageFilter([])}>Clear filters</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Repository List */}
      {filteredRepos.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
          <p className="text-sm text-muted-foreground">
            {search || languageFilter.length > 0
              ? "Try adjusting your search or filters"
              : "You don't have any open source repositories yet. Create a repository with a license to see it here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRepos.map((repo: Repository) => (
            <div
              key={repo.id}
              className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_var(--glow)]"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {repo.fullName}
                    </h3>
                  </div>
                  {repo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className={cn("h-3 w-3 rounded-full", languageColors[repo.language] || "bg-gray-500")} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {formatNumber(repo.forks)}
                    </span>
                    {repo.license && (
                      <Badge variant="outline" className="text-xs">
                        {repo.license}
                      </Badge>
                    )}
                    <span>Updated {formatRelativeTime(repo.pushedAt)}</span>
                  </div>
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {repo.topics.slice(0, 5).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {repo.topics.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{repo.topics.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer">
                          View on GitHub
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>View activity</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Stop tracking</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
