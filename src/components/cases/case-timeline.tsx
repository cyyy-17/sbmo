"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  MessageSquareQuote,
  FileText,
  PhoneCall,
  CalendarCheck2,
  Activity,
  FileSymlink,
  Clock,
  UserCircle,
  Search,
  ArrowUpDown,
  Tag,
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type TimelineEventType =
  | "INCIDENT"
  | "STATEMENT"
  | "NOTE"
  | "COMMUNICATION"
  | "CONFERENCE"
  | "INTERVENTION"
  | "DOCUMENT"

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  subtitle?: string
  description: string
  date: Date | string
  author: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  meta?: {
    label?: string
    value?: string
    link?: string
    tags?: string[]
  }
}

const EVENT_CONFIG: Record<
  TimelineEventType,
  {
    label: string
    icon: typeof Clock
    gradient: string
    badgeBg: string
    borderColor: string
    textColor: string
    iconColor: string
    pillBg: string
  }
> = {
  INCIDENT: {
    label: "Incidents",
    icon: AlertCircle,
    gradient: "from-rose-500/20 to-red-500/10",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    borderColor: "border-rose-500/20 hover:border-rose-500/40",
    textColor: "text-rose-600 dark:text-rose-400",
    iconColor: "text-rose-500",
    pillBg: "bg-rose-500/10",
  },
  STATEMENT: {
    label: "Statements",
    icon: MessageSquareQuote,
    gradient: "from-emerald-500/20 to-teal-500/10",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    textColor: "text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-500",
    pillBg: "bg-emerald-500/10",
  },
  NOTE: {
    label: "Notes",
    icon: FileText,
    gradient: "from-blue-500/20 to-sky-500/10",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
    textColor: "text-blue-600 dark:text-blue-400",
    iconColor: "text-blue-500",
    pillBg: "bg-blue-500/10",
  },
  COMMUNICATION: {
    label: "Comms",
    icon: PhoneCall,
    gradient: "from-purple-500/20 to-violet-500/10",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    borderColor: "border-purple-500/20 hover:border-purple-500/40",
    textColor: "text-purple-600 dark:text-purple-400",
    iconColor: "text-purple-500",
    pillBg: "bg-purple-500/10",
  },
  CONFERENCE: {
    label: "Conferences",
    icon: CalendarCheck2,
    gradient: "from-amber-500/20 to-orange-500/10",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    textColor: "text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-500",
    pillBg: "bg-amber-500/10",
  },
  INTERVENTION: {
    label: "Interventions",
    icon: Activity,
    gradient: "from-indigo-500/20 to-blue-500/10",
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    borderColor: "border-indigo-500/20 hover:border-indigo-500/40",
    textColor: "text-indigo-600 dark:text-indigo-400",
    iconColor: "text-indigo-500",
    pillBg: "bg-indigo-500/10",
  },
  DOCUMENT: {
    label: "Documents",
    icon: FileSymlink,
    gradient: "from-cyan-500/20 to-teal-500/10",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
    textColor: "text-cyan-600 dark:text-cyan-400",
    iconColor: "text-cyan-500",
    pillBg: "bg-cyan-500/10",
  },
}

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  const [selectedType, setSelectedType] = useState<TimelineEventType | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  // Counts by type
  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: events.length }
    for (const e of events) {
      map[e.type] = (map[e.type] || 0) + 1
    }
    return map
  }, [events])

  // Filtered & Sorted
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesType = selectedType === "ALL" || event.type === selectedType
        if (!matchesType) return false

        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          event.title.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.author.toLowerCase().includes(q) ||
          event.subtitle?.toLowerCase().includes(q) ||
          event.badge?.toLowerCase().includes(q) ||
          event.meta?.tags?.some((t) => t.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime()
        const timeB = new Date(b.date).getTime()
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB
      })
  }, [events, selectedType, searchQuery, sortOrder])

  if (events.length === 0) {
    return (
      <div className="text-center p-12 border rounded-2xl border-dashed bg-muted/20 space-y-3">
        <Clock className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
        <h3 className="text-base font-semibold">No Timeline Events Yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          As linked incidents, statements, communications, notes, and interventions are recorded, they will appear here chronologically.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Control Bar: Filters, Search, Sort */}
      <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search timeline events, authors, narratives, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/80"
            />
          </div>

          {/* Sort toggle & Summary */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-muted-foreground font-medium">
              Showing <strong>{filteredEvents.length}</strong> of {events.length} event(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="gap-1.5 text-xs h-8"
              title="Toggle chronological sort order"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
          <button
            onClick={() => setSelectedType("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-xl font-medium transition-all duration-150 shrink-0 flex items-center gap-1.5 cursor-pointer",
              selectedType === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All Events
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                selectedType === "ALL"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              {events.length}
            </span>
          </button>

          {(Object.keys(EVENT_CONFIG) as TimelineEventType[]).map((type) => {
            const config = EVENT_CONFIG[type]
            const count = counts[type] || 0
            if (count === 0) return null

            const isSelected = selectedType === type
            const Icon = config.icon

            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-xl font-medium transition-all duration-150 shrink-0 flex items-center gap-1.5 cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-primary-foreground" : config.iconColor)} />
                {config.label}
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="text-center p-12 border rounded-2xl border-dashed bg-muted/10 space-y-2">
          <SlidersHorizontal className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
          <p className="text-sm font-semibold text-foreground">No events match your filter or search.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedType("ALL")
              setSearchQuery("")
            }}
            className="text-xs text-primary"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-6 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-border/20">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, idx) => {
              const config = EVENT_CONFIG[event.type]
              const Icon = config.icon
              const eventDate = new Date(event.date)
              const formattedDate = !isNaN(eventDate.getTime())
                ? eventDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : String(event.date)

              const formattedTime = !isNaN(eventDate.getTime())
                ? eventDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
                  className="relative group"
                >
                  {/* Timeline Node Icon */}
                  <div
                    className={cn(
                      "absolute -left-6 md:-left-10 top-3 flex h-7 w-7 md:h-9 md:w-9 -translate-x-1/2 items-center justify-center rounded-xl border bg-background shadow-sm transition-all duration-200 group-hover:scale-110 z-10",
                      config.borderColor
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", config.iconColor)} />
                  </div>

                  {/* Event Card */}
                  <div
                    className={cn(
                      "rounded-2xl border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md",
                      config.borderColor
                    )}
                  >
                    {/* Header: Title, Badges, Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 border-b border-border/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                              config.badgeBg
                            )}
                          >
                            {config.label}
                          </span>
                          <h4 className="text-base font-bold text-foreground leading-tight">
                            {event.title}
                          </h4>
                          {event.badge && (
                            <Badge variant={event.badgeVariant || "outline"} className="text-[10px] uppercase font-semibold">
                              {event.badge}
                            </Badge>
                          )}
                        </div>
                        {event.subtitle && (
                          <p className="text-xs text-muted-foreground font-medium">
                            {event.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Date & Time Stamp */}
                      <div className="flex sm:flex-col sm:items-end gap-1.5 text-xs text-muted-foreground shrink-0 font-medium">
                        <span className="font-semibold text-foreground/90">{formattedDate}</span>
                        {formattedTime && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {formattedTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="py-3">
                      {event.type === "STATEMENT" ? (
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-sm font-serif italic text-foreground leading-relaxed">
                          "{event.description}"
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Meta & Author */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs">
                      {/* Author / Recorded By */}
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <UserCircle className="h-3.5 w-3.5 text-primary" />
                        <span>
                          Recorded by: <strong className="text-foreground">{event.author}</strong>
                        </span>
                      </div>

                      {/* Tags / Links if present */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.meta?.tags && event.meta.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {event.meta.tags.map((tag, tIdx) => (
                              <Badge key={tIdx} variant="secondary" className="text-[10px] font-normal py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {event.meta?.link && (
                          <Link href={event.meta.link}>
                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2 text-primary hover:text-primary">
                              {event.meta.label || "View Details"}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
