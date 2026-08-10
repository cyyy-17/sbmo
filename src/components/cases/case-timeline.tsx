"use client"

import { UserCircle, Calendar, MessageSquare, AlertCircle, Phone, Clock, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface TimelineEvent {
  id: string
  type: 'NOTE' | 'INCIDENT' | 'STATEMENT' | 'COMMUNICATION'
  title: string
  description: string
  date: Date
  author: string
}

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getIcon = (type: string) => {
    switch (type) {
      case 'NOTE': return <FileText className="w-5 h-5 text-blue-500" />
      case 'INCIDENT': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'STATEMENT': return <MessageSquare className="w-5 h-5 text-green-500" />
      case 'COMMUNICATION': return <Phone className="w-5 h-5 text-purple-500" />
      default: return <Clock className="w-5 h-5 text-slate-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'NOTE': return 'bg-blue-500/10 border-blue-500/20'
      case 'INCIDENT': return 'bg-red-500/10 border-red-500/20'
      case 'STATEMENT': return 'bg-green-500/10 border-green-500/20'
      case 'COMMUNICATION': return 'bg-purple-500/10 border-purple-500/20'
      default: return 'bg-slate-500/10 border-slate-500/20'
    }
  }

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
        No events found for this case.
      </div>
    )
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent pt-4 pb-10">
      {sortedEvents.map((event, idx) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          key={event.id} 
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-card shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
            {getIcon(event.type)}
          </div>
          
          {/* Card */}
          <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-xl border shadow-sm ${getBgColor(event.type)} transition-colors duration-300 hover:bg-card hover:shadow-md`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
              <div className="font-bold text-base text-foreground">{event.title}</div>
              <time className="text-xs font-mono font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-md shrink-0 border border-border/50">
                {new Date(event.date).toLocaleString()}
              </time>
            </div>
            <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <UserCircle className="w-3.5 h-3.5" />
              {event.author}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
