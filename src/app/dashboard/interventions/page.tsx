import { getAllInterventions } from "@/features/interventions/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Activity, ShieldAlert, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function GlobalInterventionsPage() {
  const { data: interventions, error } = await getAllInterventions()

  if (error || !interventions) {
    return <div className="p-8 text-red-500">Failed to load interventions.</div>
  }

  const activeCount = interventions.filter(i => i.status === "ACTIVE").length
  const completedCount = interventions.filter(i => i.status === "COMPLETED").length

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Global Interventions</h2>
          <p className="text-muted-foreground">Monitor and track all active behavioral plans across the school.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interventions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interventions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <ShieldAlert className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {interventions.length === 0 ? (
          <div className="col-span-full p-10 text-center text-muted-foreground border rounded-lg border-dashed">
            No interventions found in the system.
          </div>
        ) : (
          interventions.map((intervention) => (
            <Card key={intervention.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{intervention.type.replace('_', ' ')}</Badge>
                      <Badge variant={intervention.status === "ACTIVE" ? "default" : "secondary"}>
                        {intervention.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      <Link href={`/dashboard/students/${intervention.studentId}`} className="hover:underline flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {intervention.student.firstName} {intervention.student.lastName}
                      </Link>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {intervention.description}
                </p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Calendar className="w-3 h-3" />
                    Started: {new Date(intervention.startDate).toLocaleDateString()}
                  </div>
                  
                  {intervention.case && (
                    <div className="text-xs bg-muted p-2 rounded flex justify-between items-center">
                      <span>Linked Case: {intervention.case.referenceNumber}</span>
                      <Link href={`/dashboard/cases/${intervention.case.id}`}>
                        <Button variant="link" size="sm" className="h-auto p-0">View</Button>
                      </Link>
                    </div>
                  )}
                  
                  {intervention.assignedTo && (
                    <div className="text-xs text-muted-foreground">
                      Assigned to: <span className="font-medium text-foreground">{intervention.assignedTo.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
