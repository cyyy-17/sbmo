import { cn } from "@/lib/utils"

interface IllustrationProps {
  className?: string
  width?: number
  height?: number
}

// unDraw-inspired: Empty Incidents / Logs
export function EmptyIncidentsIllustration({ className, width = 160, height = 120 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mx-auto", className)}
    >
      <defs>
        <linearGradient id="incGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="incGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="incGradMuted" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {/* Background shadow ellipse */}
      <ellipse cx="100" cy="135" rx="80" ry="10" fill="currentColor" fillOpacity="0.05" />
      
      {/* Clipboard base */}
      <rect x="55" y="25" width="90" height="105" rx="14" fill="url(#incGradMuted)" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="63" y="33" width="74" height="90" rx="8" fill="currentColor" fillOpacity="0.03" />
      
      {/* Top Clip */}
      <rect x="80" y="16" width="40" height="18" rx="6" fill="url(#incGradPrimary)" />
      <circle cx="100" cy="22" r="3" fill="#ffffff" />
      
      {/* Lines & Check marks */}
      <rect x="74" y="50" width="52" height="6" rx="3" fill="currentColor" fillOpacity="0.2" />
      <rect x="74" y="65" width="40" height="6" rx="3" fill="currentColor" fillOpacity="0.15" />
      <rect x="74" y="80" width="48" height="6" rx="3" fill="currentColor" fillOpacity="0.15" />
      <rect x="74" y="95" width="30" height="6" rx="3" fill="currentColor" fillOpacity="0.1" />

      {/* Floating Shield Badge */}
      <g transform="translate(122, 78)">
        <circle cx="20" cy="20" r="20" fill="url(#incGradAccent)" />
        <path d="M20 10 L28 14 V20 C28 25 24 29 20 31 C16 29 12 25 12 20 V14 Z" fill="#ffffff" fillOpacity="0.9" />
        <circle cx="20" cy="20" r="2" fill="#f43f5e" />
      </g>
    </svg>
  )
}

// unDraw-inspired: Empty Statements / Testimony
export function EmptyStatementsIllustration({ className, width = 160, height = 120 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mx-auto", className)}
    >
      <defs>
        <linearGradient id="stmtGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="135" rx="75" ry="9" fill="currentColor" fillOpacity="0.05" />

      {/* Speech bubble main */}
      <path
        d="M45 35 C45 25 55 18 70 18 H130 C145 18 155 25 155 35 V80 C155 90 145 98 130 98 H85 L60 115 V98 H70 C55 98 45 90 45 80 Z"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2"
      />

      {/* Quotation Marks */}
      <path d="M72 45 C72 38 76 34 82 34 V42 C78 42 77 44 77 48 H82 V58 H72 Z" fill="url(#stmtGradPrimary)" />
      <path d="M90 45 C90 38 94 34 100 34 V42 C96 42 95 44 95 48 H100 V58 H90 Z" fill="url(#stmtGradPrimary)" />

      {/* Content lines */}
      <rect x="72" y="68" width="56" height="5" rx="2.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="72" y="79" width="40" height="5" rx="2.5" fill="currentColor" fillOpacity="0.15" />

      {/* Mini Pen / Quill */}
      <g transform="translate(132, 70) rotate(-35)">
        <rect x="0" y="0" width="8" height="32" rx="3" fill="#10b981" />
        <polygon points="0,32 8,32 4,40" fill="#059669" />
      </g>
    </svg>
  )
}

// unDraw-inspired: Empty Communications
export function EmptyCommunicationsIllustration({ className, width = 160, height = 120 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mx-auto", className)}
    >
      <defs>
        <linearGradient id="commGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="135" rx="75" ry="9" fill="currentColor" fillOpacity="0.05" />

      {/* Phone / Device outline */}
      <rect x="70" y="25" width="60" height="100" rx="16" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="76" y="36" width="48" height="74" rx="8" fill="currentColor" fillOpacity="0.03" />
      <circle cx="100" cy="30" r="2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="100" cy="116" r="3" fill="currentColor" fillOpacity="0.3" />

      {/* Floating call icon */}
      <circle cx="100" cy="70" r="18" fill="url(#commGrad)" />
      <path
        d="M93 64 C93 63 94 62 95 62 L97 62 C98 62 98.5 62.5 98.8 63.3 L99.5 65.5 C99.7 66.2 99.5 66.8 99 67.2 L97.8 68.2 C98.5 69.8 99.8 71.1 101.4 71.8 L102.4 70.6 C102.8 70.1 103.4 69.9 104.1 70.1 L106.3 70.8 C107.1 71.1 107.6 71.6 107.6 72.6 V74.6 C107.6 75.6 106.6 76.6 105.6 76.6 C98.6 76.6 93 71 93 64 Z"
        fill="#ffffff"
      />
    </svg>
  )
}

// unDraw-inspired: Empty Conferences
export function EmptyConferencesIllustration({ className, width = 160, height = 120 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mx-auto", className)}
    >
      <defs>
        <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="135" rx="75" ry="9" fill="currentColor" fillOpacity="0.05" />

      {/* Calendar Base */}
      <rect x="58" y="30" width="84" height="90" rx="12" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <path d="M58 42 C58 35 64 30 70 30 H130 C136 30 142 35 142 42 V50 H58 Z" fill="url(#confGrad)" />
      
      {/* Calendar Rings */}
      <rect x="74" y="24" width="6" height="12" rx="3" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
      <rect x="120" y="24" width="6" height="12" rx="3" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />

      {/* Calendar Grid Dots */}
      <circle cx="78" cy="68" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="93" cy="68" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="108" cy="68" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="123" cy="68" r="3" fill="currentColor" fillOpacity="0.2" />

      <circle cx="78" cy="84" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="93" cy="84" r="3" fill="url(#confGrad)" />
      <circle cx="108" cy="84" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="123" cy="84" r="3" fill="currentColor" fillOpacity="0.2" />

      <circle cx="78" cy="100" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="93" cy="100" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="108" cy="100" r="3" fill="currentColor" fillOpacity="0.2" />
    </svg>
  )
}

// unDraw-inspired: Empty Cases
export function EmptyCasesIllustration({ className, width = 160, height = 120 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mx-auto", className)}
    >
      <defs>
        <linearGradient id="caseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="135" rx="80" ry="10" fill="currentColor" fillOpacity="0.05" />

      {/* Folder Back */}
      <path d="M50 45 C50 38 56 32 63 32 H90 L102 44 H142 C149 44 155 50 155 57 V115 C155 122 149 128 142 128 H63 C56 128 50 122 50 115 Z" fill="currentColor" fillOpacity="0.08" />
      
      {/* Folder Front Flap */}
      <path d="M45 60 H155 L145 125 C144 128 140 130 137 130 H58 C55 130 52 128 51 125 Z" fill="url(#caseGrad)" fillOpacity="0.9" />

      {/* Magnifying Glass */}
      <g transform="translate(105, 55)">
        <circle cx="16" cy="16" r="14" stroke="#ffffff" strokeWidth="3" fill="#ffffff" fillOpacity="0.2" />
        <line x1="26" y1="26" x2="38" y2="38" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
