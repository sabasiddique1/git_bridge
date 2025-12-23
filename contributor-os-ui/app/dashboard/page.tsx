/**
 * DASHBOARD PAGE
 * 
 * Dashboard that shows user info and open source repositories
 * Uses AppShell for consistent navigation with other pages
 */

import { AppShell } from "@/components/app-shell"
import { DashboardContent } from "@/features/dashboard/components/dashboard-content"

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  )
}





