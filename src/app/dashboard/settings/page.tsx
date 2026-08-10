import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/login")
  }

  // Fetch fresh user data from DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      role: {
        select: {
          name: true,
        }
      }
    }
  })



  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-medium tracking-tight">Account Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal account settings and profile preferences.
        </p>
      </div>

      <div className="mt-8">
        <SettingsForm 
          initialData={{ 
            name: user.name || "", 
            email: user.email || "",
            role: user.role?.name || "User"
          }} 
        />
      </div>
    </div>
  )
}
