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
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 sm:px-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Student Behavior Case Management System
          </p>
        </div>
        <SystemStatusBadge />
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            description="Currently enrolled and active"
            icon={Users}
            iconColor="text-blue-500"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Active Cases"
            value={stats.activeCases}
            description="Open or under investigation"
            icon={FileStack}
            iconColor="text-amber-500"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="New Incidents"
            value={stats.newIncidents}
            description="Reported in the last 7 days"
            icon={AlertTriangle}
            iconColor="text-red-500"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '400ms' }}>
          <StatCard
            title="Active Interventions"
            value={stats.activeInterventions}
            description="Ongoing behavioral support plans"
            icon={Activity}
            iconColor="text-violet-500"
          />
        </div>
      </div>

      {/* Quick Actions + Info Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Quick Actions */}
        <div className="md:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '500ms' }}>
          <Card className="glass-card h-full border-border/50">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {[
                { href: "/dashboard/incidents/report", label: "Report New Incident", icon: AlertTriangle, color: "text-red-500 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                { href: "/dashboard/students", label: "View All Students", icon: Users, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { href: "/dashboard/cases", label: "Manage Cases", icon: FileStack, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                { href: "/dashboard/reports", label: "View Reports", icon: TrendingUp, color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-background/60 hover:shadow-sm border border-transparent hover:border-border/50 transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${action.bg} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <span className="text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Smart Insights */}
        <div className="md:col-span-2 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '600ms' }}>
          <Card className="glass-card h-full border-border/50">
            <CardHeader className="pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Lightbulb className="h-4 w-4 text-amber-500 animate-pulse" />
                </div>
                <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80">Smart Insights</CardTitle>
              </div>
              <CardDescription className="text-xs font-medium">AI-ready analytics based on current system data.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {insights.map((insight: any, idx: number) => (
                  <div
                    key={idx}
                    className={`group flex items-start gap-3.5 rounded-xl border px-4 py-3.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm ${
                      insight.type === 'negative' ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400 hover:border-red-500/40 hover:bg-red-500/10' :
                      insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10' :
                      insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/10' :
                      'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10'
                    }`}
                  >
                    <span className={`mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor] ${
                      insight.type === 'negative' ? 'bg-red-500 text-red-500' :
                      insight.type === 'positive' ? 'bg-emerald-500 text-emerald-500' :
                      insight.type === 'warning' ? 'bg-amber-500 text-amber-500' :
                      'bg-blue-500 text-blue-500'
                    }`} />
                    <p className="leading-relaxed font-medium">{insight.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
