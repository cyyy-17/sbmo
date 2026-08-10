import { getStudentById } from "@/features/students/actions"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EditStudentForm } from "./edit-form"

export default async function EditStudentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const student = await getStudentById(params.id)

  if (!student) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href={`/dashboard/students/${student.id}`} className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Profile</h2>
          <p className="text-muted-foreground text-sm">
            Update information for {student.firstName} {student.lastName} ({student.studentId}).
          </p>
        </div>
      </div>

      <EditStudentForm student={student} />
    </div>
  )
}
