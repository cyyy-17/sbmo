import { getMonitoredStudents } from "@/features/monitoring/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, User } from "lucide-react"
import Link from "next/link"

export default async function MonitoringPage() {
  const monitoredStudents = await getMonitoredStudents()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Behavior Monitoring</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track students currently under active behavioral monitoring or improvement plans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1 bg-violet-500/10 text-violet-600 border-violet-200">
            {monitoredStudents.length} Active Records
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {monitoredStudents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border rounded-xl border-dashed bg-muted/20">
            <Activity className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-medium">No active monitoring</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
              There are currently no students under active behavior monitoring or active improvement plans.
            </p>
          </div>
        ) : (
          monitoredStudents.map((record) => {
            const student = record.student
            const plan = record.behaviorPlan
            const lastUpdate = plan?.progressUpdates?.[0]
            const name = `${student.firstName} ${student.lastName}`
            
            let gradeStr = "Unknown Grade"
            if (student.enrollments?.[0]) {
              const enr = student.enrollments[0]
              gradeStr = `${enr.gradeLevel.name} - ${enr.section?.name || "Unassigned"}`
            }

            return (
              <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1 w-full bg-violet-500" />
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold">
                      <Link href={`/dashboard/students/${student.id}`} className="hover:underline">
                        {name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{student.studentId} • {gradeStr}</CardDescription>
                  </div>
                  <Badge variant={record.type === "MONITORING" ? "secondary" : "default"}>
                    {record.type.replace("_", " ")}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2 border rounded-md p-3 bg-muted/30">
                    <div>
                      <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide block mb-1">Reason / Description</span>
                      <p className="line-clamp-2">{record.description}</p>
                    </div>
                  </div>

                  {plan && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Latest Progress</span>
                        {lastUpdate && (
                          <span className="text-xs text-muted-foreground">{new Date(lastUpdate.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        )}
                      </div>
                      
                      {lastUpdate ? (
                        <div className="text-sm">
                          <p className="line-clamp-2 italic text-muted-foreground">"{lastUpdate.notes}"</p>
                          {lastUpdate.rating && (
                            <div className="mt-2 flex items-center gap-1">
                              <span className="text-xs font-medium mr-1">Rating:</span>
                              {[1, 2, 3, 4, 5].map(star => (
                                <div 
                                  key={star} 
                                  className={`h-2 w-6 rounded-full ${star <= lastUpdate.rating! ? 'bg-violet-500' : 'bg-muted'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No progress notes recorded yet.</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Monitored by: <strong>{record.assignedTo?.name || "Unassigned"}</strong></span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
