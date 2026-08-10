import { getUserById } from "@/features/users/actions"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/auth"

export default async function UserProfilePage(props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  const params = await props.params
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-start space-x-4 mb-6">
        <Link href="/dashboard/users" className="mt-1 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {user.lastName}, {user.firstName} {user.middleName} {user.suffix || ""}
            {user.preferredName && <span className="text-xl text-muted-foreground font-normal">"{user.preferredName}"</span>}
            {!user.firstName && !user.lastName && user.name}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-muted-foreground text-sm">
              {user.email} | Role: {user.role?.name?.replace("_", " ") || "No Role"}
            </p>
            <Badge 
              variant={user.isActive ? "default" : "secondary"}
              className={user.isActive ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : ""}
            >
              {user.isActive ? "Active Account" : "Inactive Account"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/users/${user.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details and contact information of the employee.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-sm">
                  {user.firstName || user.lastName ? 
                    `${user.firstName} ${user.middleName ? `${user.middleName} ` : ''}${user.lastName} ${user.suffix || ""}` : 
                    user.name
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred Name</p>
                <p className="text-sm">{user.preferredName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employment Status</p>
                <Badge variant="outline" className="mt-1">
                  {(user.employmentStatus || "ACTIVE").replace("_", " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-sm">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-sm capitalize">{user.gender?.toLowerCase() || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                <p className="text-sm">{user.contactNumber || 'Not specified'}</p>
              </div>
              <div className="col-span-1 md:col-span-3">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{user.address || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
