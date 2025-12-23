/**
 * PUBLIC DASHBOARD VIEW
 * 
 * Public dashboard that shows:
 * - User info (if logged in)
 * - Open source repositories
 * - Login/Sign up button if not logged in
 */

"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GitHubLoginButton } from "@/components/auth/github-login-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Github, 
  Star, 
  GitFork, 
  ExternalLink, 
  Code, 
  Calendar,
  Users,
  FileCode
} from "lucide-react"
import Link from "next/link"
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

function PublicDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // Important: include cookies
      })
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        // Fetch repositories if user is logged in
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
    // Check if we just logged in (from OAuth callback)
    const githubLogin = searchParams.get("github_login")
    if (githubLogin === "success") {
      // Remove query param
      router.replace("/dashboard")
      // Small delay to ensure cookies are set, then fetch user
      setTimeout(() => {
        fetchUser()
      }, 200)
    } else {
      // Fetch current user
      fetchUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router])

  const fetchRepositories = async () => {
    if (!user) return // Don't fetch if no user
    
    setReposLoading(true)
    try {
      const response = await fetch("/api/auth/github/repos", {
        credentials: "include", // Important: include cookies
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

  // Fetch repositories when user logs in
  useEffect(() => {
    if (user && !loading) {
      fetchRepositories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Contributor OS</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.login} />
                  <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.login}</span>
                <Link href="/logout">
                  <Button variant="ghost" size="sm">Logout</Button>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-2">
                  <Github className="h-4 w-4" />
                  Sign in with GitHub
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : user ? (
          <>
            {/* User Info Section */}
            <Card className="mb-8">
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
          </>
        ) : (
          /* Not Logged In State */
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
                  <GitHubLoginButton />
                </div>
                <div className="grid gap-4 md:grid-cols-3 pt-6 border-t">
                  <div className="text-center">
                    <Code className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">Open Source</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your open source contributions
                    </p>
                  </div>
                  <div className="text-center">
                    <Github className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">GitHub Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with your GitHub account
                    </p>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">Activity Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your contributions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export function PublicDashboardView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <PublicDashboardContent />
    </Suspense>
  )
}

