"use client"

import { useState, useEffect, useActionState, Suspense } from "react"
import { submitIncidentReport } from "./actions"
import { checkRepeatBehavior } from "@/features/incidents/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export default function ReportIncidentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
      <ReportIncidentForm />
    </Suspense>
  )
}

function ReportIncidentForm() {
  const searchParams = useSearchParams()
  const initialStudentId = searchParams.get("studentId") || ""
  
  const [state, formAction, isPending] = useActionState(submitIncidentReport, undefined)
  const [studentIdInput, setStudentIdInput] = useState(initialStudentId)
  const [repeatWarning, setRepeatWarning] = useState<{ recentIncidents: number, activeCases: number } | null>(null)

  useEffect(() => {
    if (studentIdInput.length > 5) {
      const timer = setTimeout(async () => {
        try {
          const res = await checkRepeatBehavior(studentIdInput)
          if (res.recentIncidents > 0 || res.activeCases > 0) {
            setRepeatWarning(res)
          } else {
            setRepeatWarning(null)
          }
        } catch (e) {
          // Add toast for network/permission failures
          toast.error("Could not verify student's disciplinary history.")
        }
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setRepeatWarning(null)
    }
  }, [studentIdInput])


  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard/incidents" className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Report Incident</h2>
          <p className="text-muted-foreground text-sm">
            Submit a new behavioral incident report.
          </p>
        </div>
      </div>

      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>Provide the necessary information about what happened.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Brief summary of the incident" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfIncident">Date & Time</Label>
                <Input id="dateOfIncident" name="dateOfIncident" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Where did this occur?" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level</Label>
                <select 
                  id="severity" 
                  name="severity" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="MINOR">Minor</option>
                  <option value="MAJOR">Major</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidentiality">Confidentiality</Label>
                <select 
                  id="confidentiality" 
                  name="confidentiality" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="CONFIDENTIAL">Confidential</option>
                  <option value="HIGHLY_CONFIDENTIAL">Highly Confidential</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Provide a detailed account of the incident..." 
                className="min-h-[150px]"
                required 
              />
            </div>
            
            {/* Note: In a real app, student selection would use an autocomplete/combobox. 
                For this MVP, we will assume a text input for Student ID. */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium">Primary Student Involved</h3>
              {repeatWarning && (
                <div className="flex items-start gap-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 mt-2">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold">Potential Repeat Behavior Detected</p>
                    <p>This student has <strong>{repeatWarning.recentIncidents}</strong> recent incidents and <strong>{repeatWarning.activeCases}</strong> active case(s).</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input 
                    id="studentId" 
                    name="studentId" 
                    placeholder="System ID of the student" 
                    required 
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="involvementType">Involvement</Label>
                  <select 
                    id="involvementType" 
                    name="involvementType" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="OFFENDER">Offender</option>
                    <option value="VICTIM">Victim</option>
                    <option value="WITNESS">Witness</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium">Evidence (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-2">Upload any supporting documents, images, or files.</p>
              <div className="space-y-2">
                <Label htmlFor="evidence">File</Label>
                <Input id="evidence" name="evidence" type="file" />
              </div>
            </div>

            {state?.error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                {state.error}
              </div>
            )}
            
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/dashboard/incidents" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              Cancel
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
