import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUsers, getRoles } from "@/features/users/actions"
import { UsersTable } from "@/components/users/users-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function UsersPage() {
  const session = await auth()
  
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  const [usersResponse, rolesResponse] = await Promise.all([
    getUsers(),
    getRoles(),
  ])

  const users = usersResponse.success ? usersResponse.data : []
  const roles = rolesResponse.success ? rolesResponse.data : []

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage system access, roles, and accounts.
          </p>
        </div>
        <Link href="/dashboard/users/add">
          <Button className="gap-2 active:scale-[0.97] transition-transform">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base">System Users</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                A list of all users who have access to the system.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable 
            users={users || []} 
            roles={roles || []} 
            currentUserId={session.user.id} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
