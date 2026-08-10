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
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-200",
        className
      )}
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/3 group-hover:to-transparent transition-all duration-300 rounded-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {title}
          </p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {value}
            </span>
            {trend !== undefined && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold mb-1 px-1.5 py-0.5 rounded-full",
                  isPositive && "text-emerald-600 bg-emerald-500/10",
                  isNegative && "text-red-500 bg-red-500/10",
                  isNeutral && "text-muted-foreground bg-muted"
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
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{description}</p>
          )}
        </div>
        <div 
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
            "bg-primary/8 group-hover:bg-primary/15 transition-colors duration-200"
          )}
          aria-hidden="true"
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  )
}
