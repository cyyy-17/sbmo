import { Metadata } from "next"
import { SettingsNav } from "./settings-nav"

export const metadata: Metadata = {
  title: "Settings - SBCMS",
  description: "Manage system settings",
}

const settingsNav = [
  { name: "General", href: "/dashboard/settings" },
  { name: "Violations", href: "/dashboard/settings/violations" },
  { name: "Roles & Permissions", href: "/dashboard/settings/roles" },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage system configurations and taxonomies.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/4 lg:flex-shrink-0">
          <SettingsNav items={settingsNav} />
        </aside>
        <div className="flex-1 min-w-0 lg:max-w-3xl">{children}</div>
      </div>
    </div>
  )
}
