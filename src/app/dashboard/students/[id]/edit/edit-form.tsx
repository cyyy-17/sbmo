"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateStudent } from "@/features/students/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export function EditStudentForm({ student }: { student: any }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const dob = formData.get("dateOfBirth") as string
    
    try {
      await updateStudent(student.id, {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        middleName: formData.get("middleName") as string || null,
        suffix: formData.get("suffix") as string || null,
        preferredName: formData.get("preferredName") as string || null,
        email: formData.get("email") as string || null,
        contactNumber: formData.get("contactNumber") as string || null,
        address: formData.get("address") as string || null,
        gender: formData.get("gender") as string || null,
        dateOfBirth: dob ? new Date(dob) : null,
        enrollmentStatus: formData.get("enrollmentStatus") as string || "ACTIVE",
      })
      
      router.push(`/dashboard/students/${student.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to update student profile")
      setIsPending(false)
    }
  }

  const defaultDob = student.dateOfBirth 
    ? new Date(student.dateOfBirth).toISOString().split('T')[0] 
    : ""

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update the student's personal details and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={student.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" name="middleName" defaultValue={student.middleName || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={student.lastName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input id="suffix" name="suffix" defaultValue={student.suffix || ""} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={defaultDob} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender" 
                name="gender" 
                defaultValue={student.gender || ""}
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
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input id="preferredName" name="preferredName" defaultValue={student.preferredName || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentStatus">Enrollment Status</Label>
              <select 
                id="enrollmentStatus" 
                name="enrollmentStatus" 
                defaultValue={student.enrollmentStatus || "ACTIVE"}
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={student.email || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" name="contactNumber" defaultValue={student.contactNumber || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={student.address || ""} className="resize-none h-20" />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
