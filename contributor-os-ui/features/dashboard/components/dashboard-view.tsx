/**
 * DASHBOARD VIEW
 * 
 * Main dashboard component showing overview and "Needs My Action" section.
 * 
 * TODO: Connect to real dashboard stats via useDashboardStats hook
 * TODO: Add real-time updates for stats
 * TODO: Implement "Needs My Action" filtering from events
 */

"use client"

import { useDashboardStats } from "@/hooks/queries/use-dashboard"
import { useEvents } from "@/hooks/queries/use-events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, CircleDot, CheckSquare, AlertCircle, Activity } from "lucide-react"
import { DashboardNeedsAction } from "./dashboard-needs-action"
import { DashboardRecentActivity } from "./dashboard-recent-activity"

export function DashboardView() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: events, isLoading: eventsLoading } = useEvents({ needsAction: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your open-source contributions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.openPRs || 0}</div>
            <p className="text-xs text-muted-foreground">Pull requests in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <CircleDot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.openIssues || 0}</div>
            <p className="text-xs text-muted-foreground">Issues you're tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.pendingTasks || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Action</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.needsAction || 0}</div>
            <p className="text-xs text-muted-foreground">Requires your attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Needs My Action Section */}
      <DashboardNeedsAction events={events || []} isLoading={eventsLoading} />

      {/* Recent Activity Preview */}
      <DashboardRecentActivity />
    </div>
  )
}







