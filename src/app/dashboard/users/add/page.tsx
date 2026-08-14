import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getRoles } from "@/features/users/actions"
import { AddUserForm } from "./form"

export default async function AddUserPage() {
  const session = await auth()
  
  const role = session?.user?.role
  const isAllowed = !role || role === "SUPER_ADMIN" || role === "SBMO_ADMIN" || role === "ADMIN" || role === "PRINCIPAL"
  if (!isAllowed) {
    redirect("/dashboard")
  }

  const rolesResponse = await getRoles()
  const roles = rolesResponse.success ? rolesResponse.data : []

  return <AddUserForm roles={roles || []} />
}
