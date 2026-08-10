"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ReportStats {
  casesByStatus: Array<{ name: string; value: number; fill: string }>
  interventionsByType: Array<{ name: string; total: number }>
  incidentsOverTime: Array<{ name: string; total: number; critical: number }>
}

export function ReportsCharts({ stats }: { stats: ReportStats }) {
  const maxIncidents = Math.max(10, ...stats.incidentsOverTime.map(m => m.total))
  const maxInterventions = Math.max(10, ...stats.interventionsByType.map(i => i.total))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Cases by Status */}
      <Card className="lg:col-span-1 group hover:border-primary/30 transition-colors duration-300">
        <CardHeader>
          <CardTitle>Cases by Status</CardTitle>
          <CardDescription>Current snapshot of all case statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-4">
            {stats.casesByStatus.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">No cases found.</div>
            ) : (
              stats.casesByStatus.map((c, i) => {
                const total = stats.casesByStatus.reduce((acc, curr) => acc + curr.value, 0)
                const percentage = total > 0 ? Math.round((c.value / total) * 100) : 0
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    key={i} 
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: c.fill }}></div>
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground font-medium">{c.value}</span>
                      <span className="text-xs w-10 text-right font-mono bg-muted/50 py-0.5 rounded-sm">{percentage}%</span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interventions by Type */}
      <Card className="lg:col-span-2 group hover:border-primary/30 transition-colors duration-300">
        <CardHeader>
          <CardTitle>Interventions by Type</CardTitle>
          <CardDescription>Total interventions assigned grouped by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 mt-2">
            {stats.interventionsByType.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">No interventions found.</div>
            ) : (
              stats.interventionsByType.map((inv, i) => {
                const width = `${Math.max(1, (inv.total / maxInterventions) * 100)}%`
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium text-muted-foreground">{inv.name.toLowerCase()}</span>
                      <span className="font-bold">{inv.total}</span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                        className="h-full bg-primary rounded-full relative overflow-hidden" 
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 w-full" />
                      </motion.div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incidents Over Time */}
      <Card className="md:col-span-2 lg:col-span-3 group hover:border-primary/30 transition-colors duration-300">
        <CardHeader>
          <CardTitle>Incidents Over Time</CardTitle>
          <CardDescription>Monthly distribution of reported incidents this year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full flex items-end justify-between gap-2 mt-4 pt-4 border-b border-border/50">
            {stats.incidentsOverTime.map((month, i) => {
              const heightTotal = `${Math.max(1, (month.total / maxIncidents) * 100)}%`
              const heightCritical = month.total > 0 ? `${(month.critical / month.total) * 100}%` : '0%'
              
              return (
                <div key={i} className="relative flex flex-col items-center justify-end h-full w-full group/bar">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-12 bg-popover border border-border shadow-md text-popover-foreground text-xs rounded-lg p-2.5 whitespace-nowrap transition-all duration-200 z-10 pointer-events-none transform translate-y-2 group-hover/bar:translate-y-0">
                    <div className="font-semibold mb-1 border-b border-border/50 pb-1">{month.name}</div>
                    <div className="flex justify-between gap-4"><span>Total:</span> <span className="font-mono">{month.total}</span></div>
                    <div className="flex justify-between gap-4 text-destructive"><span>Critical:</span> <span className="font-mono">{month.critical}</span></div>
                  </div>
                  {/* Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: heightTotal }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.05 }}
                    className="w-full max-w-[48px] bg-primary/15 rounded-t-md relative flex flex-col justify-end transition-colors duration-300 group-hover/bar:bg-primary/25 overflow-hidden border border-primary/10 border-b-0"
                  >
                    {/* Critical sub-bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: heightCritical }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 + (i * 0.05) }}
                      className="w-full bg-destructive/90 rounded-t-sm"
                    />
                  </motion.div>
                  <span className="text-xs font-medium text-muted-foreground mt-3 block h-6 group-hover/bar:text-foreground transition-colors">{month.name.substring(0,3)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-primary/25 border border-primary/20 rounded-sm"></div>
               <span className="text-xs font-medium text-muted-foreground">All Incidents</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-destructive/90 rounded-sm"></div>
               <span className="text-xs font-medium text-muted-foreground">Critical/Major</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
