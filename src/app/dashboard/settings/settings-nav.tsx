"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SettingsNavProps {
  items: { name: string; href: string }[]
}

export function SettingsNav({ items }: SettingsNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex overflow-x-auto space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0 custom-scrollbar">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary/10 text-primary"
                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
