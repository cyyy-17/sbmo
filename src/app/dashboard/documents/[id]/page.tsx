import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { DocumentViewer } from "@/components/documents/document-viewer"
import { requirePermission } from "@/lib/rbac"

export default async function ViewDocumentPage(props: { params: Promise<{ id: string }> }) {
  await requirePermission("documents.view")
  
  const params = await props.params
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      user: true
    }
  })

  if (!document) notFound()

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <DocumentViewer
        title={document.title}
        content={document.content}
        date={document.createdAt}
        authorName={document.user.name || "Unknown"}
      />
    </div>
  )
}
