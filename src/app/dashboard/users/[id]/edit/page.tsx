import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EditUserForm } from "./edit-user-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  
  if (session?.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-destructive">Unauthorized</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  const [user, roles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      include: { role: true }
    }),
    prisma.role.findMany()
  ])

  if (!user) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard/users" className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
          <p className="text-muted-foreground text-sm">
            Modify details and permissions for {user.name || user.email}.
          </p>
        </div>
      </div>
      
      <EditUserForm user={user} roles={roles} />
    </div>
  )
}
