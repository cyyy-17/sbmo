import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/layout/command-palette"
import { SessionTimeoutProvider } from "@/components/auth/session-timeout-provider"
import { auth } from "@/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role

  return (
    <SessionTimeoutProvider>
      <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
          <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} />
          <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[100px] animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
        </div>

        <Sidebar userRole={role} />
        
        <div className="flex flex-1 flex-col min-w-0 h-screen relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        <CommandPalette />
      </div>
    </SessionTimeoutProvider>
  )
}
