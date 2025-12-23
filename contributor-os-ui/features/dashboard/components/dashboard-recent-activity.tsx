/**
 * DASHBOARD RECENT ACTIVITY
 * 
 * Shows preview of recent activity from timeline.
 * 
 * TODO: Connect to actual recent events
 * TODO: Add "View Timeline" link
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, ArrowRight } from "lucide-react"
import Link from "next/link"

export function DashboardRecentActivity() {
  // TODO: Fetch recent events
  const recentActivity = []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your repositories</CardDescription>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              View Timeline
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* TODO: Render recent events */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}







