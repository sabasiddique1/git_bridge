/**
 * DASHBOARD CONTENT
 * 
 * Dashboard content component that shows:
 * - User info
 * - Open source repositories
 * 
 * This component is used inside AppShell for consistent navigation
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  GitFork, 
  ExternalLink, 
  Code, 
  Calendar,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: number
  login: string
  avatar_url: string
  name?: string
  email?: string
  bio?: string
}

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
  updatedAt: string
}

export function DashboardContent() {
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      })
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        fetchRepositories()
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchRepositories = async () => {
    if (!user) return
    
    setReposLoading(true)
    try {
      const response = await fetch("/api/auth/github/repos", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setRepos(data.repos || [])
      }
    } catch (error) {
      console.error("Error fetching repositories:", error)
    } finally {
      setReposLoading(false)
    }
  }

  useEffect(() => {
    if (user && !loading) {
      fetchRepositories()
    }
  }, [user, loading])

  const languageColors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-400",
    Python: "bg-green-500",
    Java: "bg-orange-500",
    Rust: "bg-orange-600",
    Go: "bg-cyan-500",
    "C++": "bg-blue-600",
    C: "bg-gray-600",
    Ruby: "bg-red-500",
    PHP: "bg-indigo-500",
    Swift: "bg-orange-400",
    Kotlin: "bg-purple-500",
    Dart: "bg-blue-400",
    HTML: "bg-orange-500",
    CSS: "bg-blue-500",
    Shell: "bg-gray-500",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome to Contributor OS</CardTitle>
            <CardDescription className="mt-2 text-lg">
              Your personal operating system for open-source contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Sign in with GitHub to view your open source repositories and contribution activity
              </p>
              <a href="/login">
                <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Sign in with GitHub
                </button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} alt={user.login} />
              <AvatarFallback className="text-2xl">
                {user.login.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name || user.login}</CardTitle>
              <CardDescription className="mt-1">@{user.login}</CardDescription>
              {user.bio && (
                <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
              )}
              {user.email && (
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Open Source Repositories Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Open Source Repositories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your public repositories with open source licenses
          </p>
        </div>
        {repos.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {repos.length} repositories
          </Badge>
        )}
      </div>

      {reposLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading repositories...</div>
        </div>
      ) : repos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Code className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No open source repositories found. Make sure your repositories have licenses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <Card key={repo.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {repo.name}
                    </CardTitle>
                    <CardDescription className="mt-1 font-mono text-xs">
                      {repo.fullName}
                    </CardDescription>
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {repo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-3 w-3 rounded-full",
                          languageColors[repo.language] || "bg-gray-500"
                        )}
                      />
                      <span className="text-xs text-muted-foreground">{repo.language}</span>
                    </div>
                  )}
                  {repo.license && (
                    <Badge variant="outline" className="text-xs">
                      {repo.license}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    <span>{repo.forks}</span>
                  </div>
                  {repo.ownerType === "Organization" && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Org</span>
                    </div>
                  )}
                </div>

                {repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {repo.topics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{repo.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

