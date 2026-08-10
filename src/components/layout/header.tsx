import { auth } from "@/auth"
import { getUserNotifications } from "@/features/notifications/actions"
import { HeaderClient } from "./header-client"

export async function Header() {
  const session = await auth()
  const { data: notifications } = await getUserNotifications()
  const role = session?.user?.role

  return (
    <HeaderClient
      userImage={session?.user?.image}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
      userRole={role}
      notifications={notifications || []}
    />
  )
}
