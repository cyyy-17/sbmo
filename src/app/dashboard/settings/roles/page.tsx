import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Check, Lock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RolesPermissionsPage() {
  const session = await auth()
  
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
    redirect("/dashboard/settings")
  }

  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      },
      _count: {
        select: { users: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium tracking-tight">Roles & Permissions</h3>
          <p className="text-sm text-muted-foreground">
            View system roles, their assigned permissions, and user distributions.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {role.description || "System assigned role."}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-sm bg-background border px-3 py-1 rounded-full font-medium">
                  {role._count.users} Users
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> 
                Assigned Permissions
              </h4>
              
              {role.permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No specific permissions assigned to this role.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {role.permissions.map((rp) => (
                    <div key={rp.id} className="flex items-start gap-2 text-sm bg-muted/20 p-2 rounded-md border">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium block">{rp.permission.name}</span>
                        {rp.permission.description && (
                          <span className="text-xs text-muted-foreground block">{rp.permission.description}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
