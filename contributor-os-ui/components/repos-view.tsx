"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Star, GitFork, ExternalLink, Pin, MoreHorizontal, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Repository {
  id: string
  name: string
  fullName: string
  description: string
  language: string
  stars: string
  forks: string
  pinned: boolean
  lastActivity: string
  myContributions: number
}

const mockRepos: Repository[] = [
  {
    id: "1",
    name: "next.js",
    fullName: "vercel/next.js",
    description: "The React Framework for the Web",
    language: "TypeScript",
    stars: "128k",
    forks: "27.4k",
    pinned: true,
    lastActivity: "2 hours ago",
    myContributions: 15,
  },
  {
    id: "2",
    name: "react",
    fullName: "facebook/react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    language: "JavaScript",
    stars: "230k",
    forks: "47.2k",
    pinned: true,
    lastActivity: "5 hours ago",
    myContributions: 8,
  },
  {
    id: "3",
    name: "tailwindcss",
    fullName: "tailwindlabs/tailwindcss",
    description: "A utility-first CSS framework for rapid UI development.",
    language: "CSS",
    stars: "85k",
    forks: "4.2k",
    pinned: true,
    lastActivity: "1 day ago",
    myContributions: 3,
  },
  {
    id: "4",
    name: "turborepo",
    fullName: "vercel/turborepo",
    description: "High-performance build system for JavaScript and TypeScript codebases.",
    language: "Rust",
    stars: "26k",
    forks: "1.8k",
    pinned: false,
    lastActivity: "3 days ago",
    myContributions: 2,
  },
]

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  CSS: "bg-purple-500",
  Rust: "bg-orange-500",
}

export function ReposView() {
  const [search, setSearch] = useState("")
  const [languageFilter, setLanguageFilter] = useState<string[]>([])

  const languages = [...new Set(mockRepos.map((r) => r.language))]

  const filteredRepos = mockRepos.filter((repo) => {
    const matchesSearch = repo.fullName.toLowerCase().includes(search.toLowerCase())
    const matchesLanguage = languageFilter.length === 0 || languageFilter.includes(repo.language)
    return matchesSearch && matchesLanguage
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Repositories</h2>
          <p className="text-sm text-muted-foreground">{mockRepos.length} tracked repositories</p>
        </div>
        <Button className="gap-2">
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
          <DropdownMenuContent>
            {languages.map((lang) => (
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
                <span className={cn("mr-2 h-2 w-2 rounded-full", languageColors[lang])} />
                {lang}
              </DropdownMenuCheckboxItem>
            ))}
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
      <div className="grid gap-4">
        {filteredRepos.map((repo) => (
          <div
            key={repo.id}
            className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_var(--glow)]"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {repo.fullName}
                  </h3>
                  {repo.pinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{repo.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className={cn("h-3 w-3 rounded-full", languageColors[repo.language])} />
                    {repo.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {repo.forks}
                  </span>
                  <span>Last active {repo.lastActivity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {repo.myContributions} contributions
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{repo.pinned ? "Unpin" : "Pin to sidebar"}</DropdownMenuItem>
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
    </div>
  )
}
