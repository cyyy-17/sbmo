"use client"

import { useActionState } from "react"
import { submitAddStudent } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddStudentPage() {
  const [state, formAction, isPending] = useActionState(submitAddStudent, undefined)

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard/students" className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Student</h2>
          <p className="text-muted-foreground text-sm">
            Register a new student in the system.
          </p>
        </div>
      </div>

      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Enter the personal and academic details of the student.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" name="studentId" placeholder="e.g. 2023-0001" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" placeholder="First Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" name="middleName" placeholder="Middle Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Last Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suffix">Suffix</Label>
                <Input id="suffix" name="suffix" placeholder="e.g. Jr, III" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select 
                  id="gender" 
                  name="gender" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred Name (Optional)</Label>
                <Input id="preferredName" name="preferredName" placeholder="Nickname" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollmentStatus">Enrollment Status</Label>
                <select 
                  id="enrollmentStatus" 
                  name="enrollmentStatus" 
                  defaultValue="ACTIVE"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="TRANSFERRED">Transferred</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input id="email" name="email" type="email" placeholder="student@school.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
                <Input id="contactNumber" name="contactNumber" placeholder="+1234567890" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="Home Address" />
            </div>

            {state?.error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                {state.error}
              </div>
            )}
            
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/dashboard/students" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              Cancel
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Student"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
