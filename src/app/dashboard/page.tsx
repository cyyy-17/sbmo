import { StatCard } from "@/components/ui/stat-card"
import { getDashboardStats, getSmartInsights } from "@/features/dashboard/actions"
import { Users, FileStack, AlertTriangle, Activity, Clock, CheckCircle, TrendingUp, Shield, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SystemStatusBadge } from "@/components/dashboard/system-status-badge"
import Link from "next/link"

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const insights = await getSmartInsights()

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Student Behavior Case Management System
          </p>
        </div>
        <SystemStatusBadge />
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          description="Currently enrolled and active"
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Active Cases"
          value={stats.activeCases}
          description="Open or under investigation"
          icon={FileStack}
          iconColor="text-amber-500"
        />
        <StatCard
          title="New Incidents"
          value={stats.newIncidents}
          description="Reported in the last 7 days"
          icon={AlertTriangle}
          iconColor="text-red-500"
        />
        <StatCard
          title="Active Interventions"
          value={stats.activeInterventions}
          description="Ongoing behavioral support plans"
          icon={Activity}
          iconColor="text-violet-500"
        />
      </div>

      {/* Quick Actions + Info Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Quick Actions */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/dashboard/incidents/report", label: "Report New Incident", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
              { href: "/dashboard/students", label: "View All Students", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
              { href: "/dashboard/cases", label: "Manage Cases", icon: FileStack, color: "text-amber-500", bg: "bg-amber-500/10" },
              { href: "/dashboard/reports", label: "View Reports", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted/60 transition-all duration-150 active:scale-[0.98] group"
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${action.bg} flex-shrink-0`}>
                  <action.icon className={`h-3.5 w-3.5 ${action.color}`} />
                </div>
                <span className="text-foreground group-hover:text-primary transition-colors">{action.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Smart Insights */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-semibold">Smart Insights</CardTitle>
            </div>
            <CardDescription className="text-xs">AI-ready analytics based on current system data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                    insight.type === 'negative' ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400' :
                    insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                    insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400' :
                    'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  <span className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${
                    insight.type === 'negative' ? 'bg-red-500' :
                    insight.type === 'positive' ? 'bg-emerald-500' :
                    insight.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`} />
                  <p className="leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
