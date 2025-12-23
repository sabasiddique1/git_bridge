"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Activity,
  CheckSquare,
  Calendar,
  FolderGit2,
  FileText,
  Settings,
  Search,
  Command,
  ChevronDown,
  Github,
  Star,
  GitPullRequest,
  CircleDot,
  LayoutDashboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timeline", href: "/", icon: Activity, badge: 12 },
  { name: "Tasks", href: "/tasks", icon: CheckSquare, badge: 5 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Repositories", href: "/repos", icon: FolderGit2 },
  { name: "Notes", href: "/notes", icon: FileText },
]

const pinnedRepos = [
  { name: "vercel/next.js", language: "TypeScript", stars: "128k" },
  { name: "facebook/react", language: "JavaScript", stars: "230k" },
  { name: "tailwindlabs/tailwindcss", language: "CSS", stars: "85k" },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Timeline")
  const [reposOpen, setReposOpen] = useState(true)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Command className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sidebar-foreground">Contributor OS</span>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 bg-sidebar-accent pl-9 text-sm placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-xs text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-auto px-3 py-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setActiveItem(item.name)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeItem === item.name
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        {/* Pinned Repositories */}
        <Collapsible open={reposOpen} onOpenChange={setReposOpen} className="mt-4">
          <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground">
            <ChevronDown className={cn("h-3 w-3 transition-transform", !reposOpen && "-rotate-90")} />
            Pinned Repos
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {pinnedRepos.map((repo) => (
              <Link
                key={repo.name}
                href={`/repos/${repo.name}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{repo.name.split("/")[1]}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {repo.stars}
                </span>
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Quick Stats */}
        <div className="mt-6 space-y-2 border-t border-sidebar-border pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Stats</p>
          <div className="space-y-1 px-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-sidebar-foreground">
                <GitPullRequest className="h-4 w-4 text-chart-1" />
                Open PRs
              </span>
              <span className="font-mono text-muted-foreground">8</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-sidebar-foreground">
                <CircleDot className="h-4 w-4 text-chart-3" />
                Issues
              </span>
              <span className="font-mono text-muted-foreground">14</span>
            </div>
          </div>
        </div>
      </nav>

      {/* User & Settings */}
      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </aside>
  )
}
