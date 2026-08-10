import { getStudentById } from "@/features/students/actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, AlertCircle, ShieldAlert, Activity } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import QRCode from "react-qr-code"

export default async function StudentProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const student = await getStudentById(params.id)

  if (!student) {
    notFound()
  }

  const activeEnrollment = student.enrollments[0]
  
  // The QR code value will just be the student's internal UUID for scanning
  const qrValue = student.id

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-start space-x-4 mb-6">
        <Link href="/dashboard/students" className="mt-1 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {student.lastName}, {student.firstName} {student.middleName} {student.suffix || ""}
            {student.preferredName && <span className="text-xl text-muted-foreground font-normal">"{student.preferredName}"</span>}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-muted-foreground text-sm">
              Student ID: {student.studentId} | {activeEnrollment ? `${activeEnrollment.gradeLevel.name} - ${activeEnrollment.section?.name || 'Unassigned'}` : 'Not Enrolled'}
            </p>
            <Badge variant={student.enrollmentStatus === "ACTIVE" ? "default" : "secondary"}>
              {student.enrollmentStatus}
            </Badge>
          </div>
        </div>
          <div className="flex flex-col items-end gap-3">
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/students/${student.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </Link>
            <Link href={`/dashboard/incidents/report?studentId=${student.studentId}`}>
              <Button variant="destructive">
                <AlertCircle className="mr-2 h-4 w-4" /> Report Incident
              </Button>
            </Link>
          </div>
          <div className="p-2 bg-white rounded-md border shadow-sm shrink-0 mt-2">
            <QRCode value={qrValue} size={64} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-sm">{student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName} {student.suffix || ""}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred Name</p>
                <p className="text-sm">{student.preferredName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-sm">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-sm capitalize">{student.gender?.toLowerCase() || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{student.email || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                <p className="text-sm">{student.contactNumber || 'Not specified'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{student.address || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Guardians</CardTitle>
            <CardDescription>Emergency contacts and parents.</CardDescription>
          </CardHeader>
          <CardContent>
            {student.guardians.length === 0 ? (
              <p className="text-sm text-muted-foreground">No guardians registered.</p>
            ) : (
              <ul className="space-y-4">
                {student.guardians.map((sg) => (
                  <li key={sg.id} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{sg.guardian.firstName} {sg.guardian.lastName}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {sg.guardian.relationship}
                      </span>
                      {sg.isPrimary && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Primary</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{sg.guardian.contactNumber}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>
      
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> Interventions ({student.interventions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <CardTitle>Recent Incidents</CardTitle>
                </div>
                <CardDescription>Behavioral incidents involving this student.</CardDescription>
              </CardHeader>
              <CardContent>
                {student.incidentStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent incidents.</p>
                ) : (
                  <ul className="space-y-3">
                    {student.incidentStudents.map(is => (
                      <li key={is.incident.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{is.incident.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(is.incident.dateOfIncident).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={is.incident.status === 'OPEN' ? 'destructive' : 'secondary'}>
                          {is.incident.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-indigo-500" />
                  <CardTitle>Active Interventions</CardTitle>
                </div>
                <CardDescription>Ongoing support or disciplinary actions.</CardDescription>
              </CardHeader>
              <CardContent>
                {student.interventions.filter(i => i.status === 'ACTIVE').length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active interventions.</p>
                ) : (
                  <ul className="space-y-3">
                    {student.interventions.filter(i => i.status === 'ACTIVE').map(intervention => (
                      <li key={intervention.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{intervention.type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">Started: {new Date(intervention.startDate).toLocaleDateString()}</p>
                        </div>
                        {intervention.caseId && (
                          <Link href={`/dashboard/cases/${intervention.caseId}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted">View Case</Badge>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Interventions & Plans</h3>
            <Link href={`/dashboard/interventions/assign?studentId=${student.studentId}`}>
              <Button size="sm">Assign Intervention</Button>
            </Link>
          </div>
          {student.interventions.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No interventions recorded for this student.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {student.interventions.map(intervention => (
                <Card key={intervention.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{intervention.type.replace('_', ' ')}</Badge>
                          <Badge variant={intervention.status === "ACTIVE" ? "default" : "secondary"}>{intervention.status}</Badge>
                        </div>
                        {intervention.caseId && (
                          <Link href={`/dashboard/cases/${intervention.caseId}`}>
                            <CardDescription className="hover:underline cursor-pointer text-primary">
                              Linked to Case
                            </CardDescription>
                          </Link>
                        )}
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{intervention.description}</p>
                    
                    {intervention.behaviorPlan && (
                      <div className="bg-muted p-4 rounded-lg mt-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-semibold">Behavior Plan Details</h4>
                          <Button size="sm" variant="secondary" className="h-7 text-xs">Log Progress</Button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Goals</span>
                            <p className="text-sm whitespace-pre-wrap">{intervention.behaviorPlan.goals}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Strategies</span>
                            <p className="text-sm whitespace-pre-wrap">{intervention.behaviorPlan.strategies}</p>
                          </div>
                        </div>
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
      </Tabs>
    </div>
  )
}
