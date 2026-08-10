import { getAllConferences } from "@/features/conferences/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar as CalendarIcon, Clock, Users, User, Phone, CheckCircle, Video } from "lucide-react"

export default async function GlobalCalendarPage() {
  const { data: conferences, error } = await getAllConferences()

  if (error || !conferences) {
    return <div className="p-8 text-red-500">Failed to load calendar events.</div>
  }

  // Split into upcoming and past
  const now = new Date()
  const upcoming = conferences.filter(c => new Date(c.scheduledAt) >= now)
  const past = conferences.filter(c => new Date(c.scheduledAt) < now)

  const renderConference = (conf: any) => {
    const isCompleted = conf.status === "COMPLETED"
    
    return (
      <Card key={conf.id} className={`flex flex-col ${isCompleted ? 'opacity-70 bg-muted/30' : ''}`}>
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-primary">
                <CalendarIcon className="w-4 h-4" />
                {new Date(conf.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                <Clock className="w-4 h-4 ml-2" />
                {new Date(conf.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
              <CardTitle className="text-lg">
                <Link href={`/dashboard/students/${conf.studentId}`} className="hover:underline flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {conf.student.firstName} {conf.student.lastName}
                </Link>
              </CardTitle>
            </div>
            <Badge variant={isCompleted ? "secondary" : "default"}>
              {conf.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex-1 flex flex-col">
          {conf.case && (
            <div className="text-sm bg-muted p-2 rounded mb-4">
              <strong>Linked Case:</strong>{" "}
              <Link href={`/dashboard/cases/${conf.case.id}`} className="text-primary hover:underline font-medium">
                {conf.case.referenceNumber}
              </Link>
            </div>
          )}
          
          <div className="mt-auto">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Users className="w-3 h-3" />
              Attendees ({conf.attendees.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {conf.attendees.map((a: any, idx: number) => {
                let name = a.externalName || "Unknown"
                let icon = <User className="w-3 h-3 mr-1" />
                if (a.user) name = a.user.name
                if (a.student) name = `${a.student.firstName} ${a.student.lastName}`
                if (a.guardian) {
                  name = `${a.guardian.firstName} ${a.guardian.lastName}`
                  icon = <Phone className="w-3 h-3 mr-1" />
                }
                
                return (
                  <Badge key={idx} variant="outline" className="text-xs py-0 h-6">
                    {icon}
                    <span className="truncate max-w-[120px]">{name}</span>
                  </Badge>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Calendar</h2>
          <p className="text-muted-foreground">Global schedule for all upcoming conferences, hearings, and meetings.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" /> Upcoming Events ({upcoming.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.length === 0 ? (
              <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                No upcoming events scheduled.
              </div>
            ) : (
              upcoming.map(renderConference)
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-muted-foreground" /> Past Events ({past.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-80">
            {past.length === 0 ? (
              <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                No past events recorded.
              </div>
            ) : (
              past.map(renderConference)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
