import { requirePermission } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTemplateForm } from "@/components/documents/create-template-form"
import { Button, buttonVariants } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AddTemplatePage() {
  await requirePermission("documents.manage")

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2 mb-4">
        <Link href="/dashboard/documents" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Create Document Template</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Create a new reusable HTML template for generating documents like letters and incident reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTemplateForm />
        </CardContent>
      </Card>
    </div>
  )
}
