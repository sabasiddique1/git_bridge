/**
 * HOME PAGE / TIMELINE
 * 
 * Shows unified activity timeline
 */

import { AppShell } from "@/components/app-shell"
import { TimelineView } from "@/features/timeline/components/timeline-view"

export default function Home() {
  return (
    <AppShell>
      <TimelineView />
    </AppShell>
  )
}
