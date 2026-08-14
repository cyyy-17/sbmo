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
        "group relative overflow-hidden rounded-3xl glass-card p-5 sm:p-6",
        "border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]",
        "hover:border-primary/50 hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)]",
        "transition-all duration-300 ease-out transform hover:-translate-y-1",
        className
      )}
    >
      {/* Aceternity-style top subtle gradient shine */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Subtle radial spotlight on hover */}
      <div className="absolute -inset-px bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80 mb-2.5">
            {title}
          </p>
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums drop-shadow-sm">
              {value}
            </span>
            {trend !== undefined && (
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px] font-bold mb-1 px-2 py-0.5 rounded-full border shadow-2xs backdrop-blur-md",
                  isPositive && "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                  isNegative && "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
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
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-2.5 leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>
        <div 
          className={cn(
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-card/80 to-muted/80 border border-white/20 dark:border-white/10",
            "shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out"
          )}
          aria-hidden="true"
        >
          <Icon className={cn("h-6 w-6 drop-shadow-sm", iconColor)} />
        </div>
      </div>
    </div>
  )
}
