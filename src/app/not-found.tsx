import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <div className="rounded-full bg-destructive/10 p-6">
          <AlertCircle className="h-24 w-24 text-destructive" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            404
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page or resource you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
          <Link href="/" className="w-full sm:w-1/2">
            <Button variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-1/2">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
