import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: number // percentage: +5.2 means +5.2%, negative is down
  iconColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  iconColor = "text-primary",
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0
  const isNeutral = trend === 0

  return (
    <div
      role="region"
      aria-label={`${title}: ${value}. ${description || ""}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl glass-card p-5 sm:p-6",
        "hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(var(--primary-rgb),0.15)]",
        "transition-all duration-300 ease-out transform hover:-translate-y-1",
        className
      )}
    >
      {/* Subtle animated gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/80 mb-3 drop-shadow-sm">
            {title}
          </p>
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums drop-shadow-sm">
              {value}
            </span>
            {trend !== undefined && (
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-bold mb-1.5 px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md",
                  isPositive && "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
                  isNegative && "text-red-500 bg-red-500/10 border-red-500/20",
                  isNeutral && "text-muted-foreground bg-muted/50 border-border/50"
                )}
              >
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                {isNeutral && <Minus className="h-3 w-3" />}
                {isPositive ? "+" : ""}{trend}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-3 leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>
        <div 
          className={cn(
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-background to-muted border border-white/10 dark:border-white/5",
            "group-hover:scale-110 group-hover:rotate-3 shadow-inner transition-transform duration-300 ease-out"
          )}
          aria-hidden="true"
        >
          <Icon className={cn("h-6 w-6 drop-shadow-md", iconColor)} />
        </div>
      </div>
    </div>
  )
}
