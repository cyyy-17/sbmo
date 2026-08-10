"use client"

import { useState, useActionState, Suspense } from "react"
import { submitAssignIntervention } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Activity } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function AssignInterventionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
      <AssignInterventionForm />
    </Suspense>
  )
}

function AssignInterventionForm() {
  const searchParams = useSearchParams()
  const initialStudentId = searchParams.get("studentId") || ""
  const initialCaseId = searchParams.get("caseId") || ""
  
  const [state, formAction, isPending] = useActionState(submitAssignIntervention, undefined)
  const [type, setType] = useState("WARNING")

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard/interventions" className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assign Intervention</h2>
          <p className="text-muted-foreground text-sm">
            Create a new behavioral intervention or plan for a student.
          </p>
        </div>
      </div>

      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Intervention Details</CardTitle>
            <CardDescription>Fill out the required information to assign the intervention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID <span className="text-destructive">*</span></Label>
                <Input id="studentId" name="studentId" defaultValue={initialStudentId} placeholder="System Student ID" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseId">Case Reference (Optional)</Label>
                <Input id="caseId" name="caseId" defaultValue={initialCaseId} placeholder="Linked Case ID" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Intervention Type <span className="text-destructive">*</span></Label>
                <select 
                  id="type" 
                  name="type" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="WARNING">Warning</option>
                  <option value="DETENTION">Detention</option>
                  <option value="SUSPENSION">Suspension</option>
                  <option value="COUNSELING">Counseling</option>
                  <option value="MEDIATION">Mediation</option>
                  <option value="BEHAVIOR_PLAN">Behavior Improvement Plan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedToId">Assigned Staff (Optional)</Label>
                <Input id="assignedToId" name="assignedToId" placeholder="Staff ID to monitor this" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
                <Input id="startDate" name="startDate" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input id="endDate" name="endDate" type="datetime-local" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Details of the intervention..." 
                className="min-h-[100px]"
                required 
              />
            </div>
            
            {type === "BEHAVIOR_PLAN" && (
              <div className="p-4 border rounded-lg bg-violet-500/5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-500" />
                  Behavior Plan Specifics
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="goals">Goals <span className="text-destructive">*</span></Label>
                  <Textarea id="goals" name="goals" placeholder="What are the specific behavioral goals?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strategies">Strategies <span className="text-destructive">*</span></Label>
                  <Textarea id="strategies" name="strategies" placeholder="What strategies will be used to achieve these goals?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewDate">Review Date (Optional)</Label>
                  <Input id="reviewDate" name="reviewDate" type="date" />
                </div>
              </div>
            )}

            {state?.error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                {state.error}
              </div>
            )}
            
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/dashboard/interventions" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              Cancel
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Assigning..." : "Assign Intervention"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
