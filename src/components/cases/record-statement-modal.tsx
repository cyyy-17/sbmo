"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MessageSquare, Loader2 } from "lucide-react"
import { addStatement } from "@/features/cases/actions"
import { toast } from "sonner"

interface RecordStatementModalProps {
  caseId: string
  involvedStudents: Array<{
    id: string
    firstName: string
    lastName: string
  }>
}

export function RecordStatementModal({ caseId, involvedStudents }: RecordStatementModalProps) {
  const [open, setOpen] = useState(false)
  const [statementType, setStatementType] = useState<"WRITTEN" | "VERBAL" | "THIRD_PARTY">("WRITTEN")
  const [takerType, setTakerType] = useState<"student" | "witness">("student")
  const [selectedStudentId, setSelectedStudentId] = useState(involvedStudents[0]?.id || "")
  const [witnessName, setWitnessName] = useState("")
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.trim().length < 5) {
      toast.error("Please enter a detailed statement narrative (min 5 characters).")
      return
    }

    if (takerType === "student" && !selectedStudentId) {
      toast.error("Please select a student.")
      return
    }

    if (takerType === "witness" && !witnessName.trim()) {
      toast.error("Please enter the witness name.")
      return
    }

    startTransition(async () => {
      try {
        await addStatement({
          caseId,
          studentId: takerType === "student" ? selectedStudentId : undefined,
          witnessName: takerType === "witness" ? witnessName.trim() : undefined,
          statementType,
          content: content.trim(),
        })

        toast.success("Statement recorded and added to Case Master Timeline!")
        setContent("")
        setWitnessName("")
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        toast.error(err.message || "Failed to record statement.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2 shadow-xs cursor-pointer">
            <Plus className="h-4 w-4" />
            Record Statement
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Record Statement</DialogTitle>
                <DialogDescription className="text-xs">
                  Document an official interview, written testimony, or witness account for this case.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Person Providing Statement */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Statement Provider</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={takerType === "student" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTakerType("student")}
                  className="text-xs"
                >
                  Involved Student
                </Button>
                <Button
                  type="button"
                  variant={takerType === "witness" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTakerType("witness")}
                  className="text-xs"
                >
                  External Witness / Staff
                </Button>
              </div>
            </div>

            {takerType === "student" ? (
              <div className="space-y-1.5">
                <Label htmlFor="studentSelect" className="text-xs font-medium">
                  Select Student
                </Label>
                {involvedStudents.length > 0 ? (
                  <select
                    id="studentSelect"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background"
                  >
                    {involvedStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="No linked students found. Switch to witness."
                    disabled
                    className="text-xs"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="witnessName" className="text-xs font-medium">
                  Witness / Person Full Name
                </Label>
                <Input
                  id="witnessName"
                  placeholder="e.g. Mr. Roberto Garcia (Teacher / Eyewitness)"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            )}

            {/* Statement Type */}
            <div className="space-y-1.5">
              <Label htmlFor="statementType" className="text-xs font-medium">
                Statement Format
              </Label>
              <select
                id="statementType"
                value={statementType}
                onChange={(e) => setStatementType(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background"
              >
                <option value="WRITTEN">Written Statement</option>
                <option value="VERBAL">Verbal / Oral Interview</option>
                <option value="THIRD_PARTY">Third-Party Report</option>
              </select>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label htmlFor="statementContent" className="text-xs font-medium">
                Statement Narrative <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="statementContent"
                placeholder="Enter the complete statement, testimony, or interview notes as stated by the person..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[140px] text-xs font-serif leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving Statement...
                </>
              ) : (
                "Save Statement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
