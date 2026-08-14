"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search, FolderOpen, AlertCircle, FileText, Settings, Users, LineChart } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl bg-popover text-popover-foreground animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="flex flex-col w-full">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input 
              autoFocus
              placeholder="Type a command or search..." 
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            
            <Command.Group heading="Navigation" className="px-2 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mt-1"
              >
                <LineChart className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard/incidents/report"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground mt-1"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Report Incident</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard/students"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground mt-1"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Student Directory</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard/cases"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground mt-1"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                <span>View Cases</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-border my-1" />

            <Command.Group heading="Management" className="px-2 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 mt-2">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard/documents"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground mt-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Documents & Templates</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard/users"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground mt-1"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Users & Roles</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground mt-1"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>System Settings</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
