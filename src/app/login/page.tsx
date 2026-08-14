"use client"

import { useActionState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ShieldAlert, Clock, AlertTriangle } from "lucide-react"
import { authenticate } from "./actions"

function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md glass-card shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3.5">
              <ShieldAlert className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in to SBCMS</CardTitle>
          <CardDescription className="text-xs">
            Enter your credentials to access the Student Behavior Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reason === "timeout" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Your session expired due to inactivity. Please sign in again.</span>
            </div>
          )}

          {reason === "closed" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>You were automatically signed out when your browser was closed.</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@school.edu" required className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              </div>
              <Input id="password" name="password" type="password" required className="text-xs" />
            </div>
            
            {errorMessage && (
              <div className="text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                {errorMessage}
              </div>
            )}
            
            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted/40" />}>
      <LoginForm />
    </Suspense>
  )
}
