import { getCaseDetails, updateCaseStatus } from "@/features/cases/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notFound } from "next/navigation"
import { AlertCircle, Clock, CheckCircle, FolderOpen, UserCircle, Calendar, FileText, MessageSquare, Phone, Activity, FileSymlink, Printer, History } from "lucide-react"
import Link from "next/link"
import { CaseTimeline } from "@/components/cases/case-timeline"

export default async function CaseDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const caseData = await getCaseDetails(params.id)

  if (!caseData) notFound()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <Badge variant="destructive" className="bg-red-500/10 text-red-500"><AlertCircle className="w-3 h-3 mr-1"/> Open</Badge>
      case "INVESTIGATING": return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500"><Clock className="w-3 h-3 mr-1"/> Investigating</Badge>
      case "RESOLVED": return <Badge variant="default" className="bg-green-500/10 text-green-500"><CheckCircle className="w-3 h-3 mr-1"/> Resolved</Badge>
      case "CLOSED": return <Badge variant="outline"><FolderOpen className="w-3 h-3 mr-1"/> Closed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  // Aggregate events for the timeline
  const timelineEvents = [
    ...caseData.notes.map(n => ({ id: n.id, type: 'NOTE' as const, title: 'Investigation Note', description: n.content, date: n.createdAt, author: n.author.name || "Unknown" })),
    ...caseData.incidents.map(i => ({ id: i.id, type: 'INCIDENT' as const, title: `Incident Linked: ${i.title}`, description: i.description, date: i.dateOfIncident, author: i.reporter.name || "Unknown" })),
    ...caseData.statements.map(s => ({ id: s.id, type: 'STATEMENT' as const, title: `Statement: ${s.statementType}`, description: s.content, date: s.dateTaken, author: s.takenBy.name || "Unknown" })),
    ...caseData.communications.map(c => ({ id: c.id, type: 'COMMUNICATION' as const, title: `Communication: ${c.type}`, description: c.notes, date: c.contactDate, author: c.user.name || "Unknown" })),
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Badge variant="outline" className="font-mono text-sm">{caseData.referenceNumber}</Badge>
            {getStatusBadge(caseData.status)}
            <Badge variant={(caseData.confidentiality || 'STANDARD') === 'HIGHLY_CONFIDENTIAL' ? 'destructive' : (caseData.confidentiality || 'STANDARD') === 'CONFIDENTIAL' ? 'default' : 'secondary'}>
              {(caseData.confidentiality || 'STANDARD').replace('_', ' ')}
            </Badge>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{caseData.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            {caseData.description || "No description provided."}
          </p>
        </div>
        <div className="flex flex-col space-y-2 min-w-[200px]">
          <div className="text-sm bg-muted/50 p-3 rounded-lg border">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="font-medium">{caseData.assignedTo?.name || "Unassigned"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened:</span>
              <span className="font-medium">{new Date(caseData.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <form action={async () => {
            "use server";
            // Simple status toggle for MVP
            const nextStatus = caseData.status === "OPEN" ? "INVESTIGATING" 
                             : caseData.status === "INVESTIGATING" ? "RESOLVED" 
                             : caseData.status === "RESOLVED" ? "CLOSED" 
                             : "OPEN"
            await updateCaseStatus(caseData.id, nextStatus)
          }}>
            <Button type="submit" className="w-full" variant={caseData.status === 'RESOLVED' ? 'outline' : 'default'}>
              {caseData.status === 'OPEN' ? 'Start Investigation' : 
               caseData.status === 'INVESTIGATING' ? 'Mark as Resolved' : 
               caseData.status === 'RESOLVED' ? 'Close Case' : 'Reopen Case'}
            </Button>
          </form>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="overflow-x-auto w-full justify-start h-auto p-1 flex-wrap md:flex-nowrap">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <History className="w-4 h-4" /> Master Timeline
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Linked Incidents ({caseData.incidents.length})
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Statements ({caseData.statements.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2 hidden">
            <FileText className="w-4 h-4" /> Investigation Notes
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> Communications ({caseData.communications.length})
          </TabsTrigger>
          <TabsTrigger value="conferences" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Conferences ({caseData.conferences.length})
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> Interventions ({caseData.interventions.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileSymlink className="w-4 h-4" /> Documents ({(caseData as any).documents?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4 mt-6">
          <CaseTimeline events={timelineEvents} />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {caseData.incidents.map(incident => (
            <Card key={incident.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{incident.title}</CardTitle>
                  <Badge variant="outline">{incident.referenceNumber}</Badge>
                </div>
                <CardDescription>
                  Reported by {incident.reporter.name} on {new Date(incident.dateOfIncident).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
                {incident.students.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Students Involved</h4>
                    <div className="flex flex-wrap gap-2">
                      {incident.students.map(is => (
                        <Badge key={is.id} variant="secondary">
                          {is.student.firstName} {is.student.lastName} ({is.involvementType})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {caseData.incidents.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
              No incidents linked to this case.
            </div>
          )}
        </TabsContent>

        <TabsContent value="statements" className="space-y-4">
          {/* We would typically have a button here to "Add Statement" */}
          {caseData.statements.map(statement => (
            <Card key={statement.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-muted-foreground" />
                      {statement.student 
                        ? `${statement.student.firstName} ${statement.student.lastName} (Student)`
                        : `${statement.witnessName} (Witness)`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" /> {new Date(statement.dateTaken).toLocaleString()}
                      <span className="mx-1">•</span>
                      Type: {statement.statementType}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Taken by: {statement.takenBy.name}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-md border text-sm whitespace-pre-wrap font-serif">
                  "{statement.content}"
                </div>
              </CardContent>
            </Card>
          ))}
          {caseData.statements.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
              No statements have been recorded yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {caseData.notes.map((note, idx) => (
              <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-primary-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-sm">{note.author.name}</div>
                    <time className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</time>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {note.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {caseData.notes.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
              No investigation notes yet.
            </div>
          )}
        </TabsContent>
        <TabsContent value="communications" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Communication Logs</h3>
            <Button size="sm">Log Contact</Button>
          </div>
          {caseData.communications.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <Phone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No communications logged for this case.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {caseData.communications.map(comm => (
                <Card key={comm.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{comm.type}</Badge>
                          <Badge variant={comm.status === "COMPLETED" ? "default" : "secondary"}>{comm.status}</Badge>
                        </div>
                        <CardDescription>
                          {new Date(comm.contactDate).toLocaleString()} • Logged by {comm.user.name}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{comm.notes}</p>
                    <div className="mt-4 pt-4 border-t flex gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Student:</strong> {comm.student.firstName} {comm.student.lastName}
                      </div>
                      {comm.guardian && (
                        <div>
                          <strong>Guardian:</strong> {comm.guardian.firstName} {comm.guardian.lastName} ({comm.guardian.relationship})
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conferences" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Scheduled Conferences</h3>
            <Button size="sm">Schedule Conference</Button>
          </div>
          {caseData.conferences.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No conferences scheduled for this case.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {caseData.conferences.map(conf => (
                <Card key={conf.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            conf.status === 'COMPLETED' ? 'default' : 
                            conf.status === 'SCHEDULED' ? 'secondary' : 'outline'
                          }>{conf.status}</Badge>
                          <span className="text-sm font-medium">
                            {new Date(conf.scheduledAt).toLocaleString()}
                          </span>
                        </div>
                        <CardDescription>
                          Organized by {conf.organizer.name}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Attendees</h4>
                        <div className="flex flex-wrap gap-2">
                          {conf.attendees.map(a => (
                            <Badge key={a.id} variant="secondary">
                              {a.attendeeType === 'STUDENT' && a.student ? `${a.student.firstName} ${a.student.lastName} (Student)` :
                               a.attendeeType === 'GUARDIAN' && a.guardian ? `${a.guardian.firstName} ${a.guardian.lastName} (${a.guardian.relationship})` :
                               a.attendeeType === 'STAFF' && a.user ? `${a.user.name} (Staff)` :
                               a.externalName ? `${a.externalName} (External)` : 'Unknown'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {conf.resolutionNotes && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-1">Resolution Notes</h4>
                          <p className="text-sm">{conf.resolutionNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Interventions & Plans</h3>
            <Link href={`/dashboard/interventions/assign?caseId=${caseData.id}`}>
              <Button size="sm">Assign Intervention</Button>
            </Link>
          </div>
          {caseData.interventions.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No interventions assigned for this case.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {caseData.interventions.map(intervention => (
                <Card key={intervention.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{intervention.type.replace('_', ' ')}</Badge>
                          <Badge variant={intervention.status === "ACTIVE" ? "default" : "secondary"}>{intervention.status}</Badge>
                        </div>
                        <CardDescription>
                          Assigned to {intervention.student.firstName} {intervention.student.lastName}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{intervention.description}</p>
                    
                    {intervention.behaviorPlan && (
                      <div className="bg-card border shadow-sm p-5 rounded-lg mt-5 mb-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-violet-500" /> 
                          Behavior Improvement Plan
                        </h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-muted/40 p-3 rounded-md border border-muted">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                              Baseline & Goals
                            </span>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{intervention.behaviorPlan.goals}</p>
                          </div>
                          
                          <div className="bg-muted/40 p-3 rounded-md border border-muted">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                              Expected Behavior & Strategies
                            </span>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{intervention.behaviorPlan.strategies}</p>
                          </div>
                        </div>

                        {intervention.behaviorPlan.reviewDate && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                            <Calendar className="w-4 h-4" />
                            <strong>Next Review:</strong> {new Date(intervention.behaviorPlan.reviewDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div>
                        <strong>Start Date:</strong> {new Date(intervention.startDate).toLocaleDateString()}
                      </div>
                      {intervention.endDate && (
                        <div>
                          <strong>End Date:</strong> {new Date(intervention.endDate).toLocaleDateString()}
                        </div>
                      )}
                      {intervention.assignedTo && (
                        <div>
                          <strong>Monitored By:</strong> {intervention.assignedTo.name}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button>
              <Printer className="w-4 h-4 mr-2" /> Generate Document
            </Button>
          </div>
          {!(caseData as any).documents || (caseData as any).documents.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/20 border-dashed">
              <FileSymlink className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">No Documents Generated</h3>
              <p className="text-muted-foreground mb-4">Generate official letters and reports for this case.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(caseData as any).documents.map((doc: any) => (
                <Card key={doc.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          <Link href={`/dashboard/documents/${doc.id}`} className="hover:underline">
                            {doc.title}
                          </Link>
                        </CardTitle>
                        <Badge variant="outline" className="mt-1">{doc.template?.name}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                      Generated by {doc.user.name} on {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <Link href={`/dashboard/documents/${doc.id}`} className="w-full">
                      <Button variant="secondary" className="w-full text-xs" size="sm">
                        <Printer className="w-3 h-3 mr-2" /> View & Print
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
