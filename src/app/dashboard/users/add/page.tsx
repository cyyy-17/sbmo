import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getRoles } from "@/features/users/actions"
import { AddUserForm } from "./form"

export default async function AddUserPage() {
  const session = await auth()
  
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  const rolesResponse = await getRoles()
  const roles = rolesResponse.success ? rolesResponse.data : []

  return <AddUserForm roles={roles || []} />
}
