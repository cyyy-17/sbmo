import { getAuditLogs } from "@/lib/audit"
import { ActivityTable } from "@/components/activity/activity-table"
import { ClipboardList, ShieldCheck } from "lucide-react"

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams?.page) || 1
  const { logs, limit } = await getAuditLogs(currentPage, 50)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 shadow-lg text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Secure Audit Trail</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Activity Logs</h2>
            <p className="text-slate-300 text-base leading-relaxed">
              System-wide monitor of all major actions, modifications, and access records. 
              Review changes dynamically to maintain security and compliance.
            </p>
          </div>
          
          <div className="hidden md:flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <ClipboardList className="h-16 w-16 text-slate-300 opacity-80" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <ActivityTable logs={logs} limit={limit} />
      </div>
    </div>
  )
}
