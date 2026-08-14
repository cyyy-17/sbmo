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
import { Phone, Plus, Loader2 } from "lucide-react"
import { logCommunication } from "@/features/communications/actions"
import { toast } from "sonner"

interface LogContactModalProps {
  caseId: string
  involvedStudents: Array<{
    id: string
    firstName: string
    lastName: string
  }>
}

export function LogContactModal({ caseId, involvedStudents }: LogContactModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(involvedStudents[0]?.id || "")
  const [commType, setCommType] = useState("CALL")
  const [status, setStatus] = useState("COMPLETED")
  const [contactDate, setContactDate] = useState(new Date().toISOString().slice(0, 16))
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId) {
      toast.error("Please select a student.")
      return
    }
    if (!notes.trim() || notes.trim().length < 5) {
      toast.error("Please enter detailed communication notes.")
      return
    }

    startTransition(async () => {
      try {
        const res = await logCommunication({
          type: commType,
          notes: notes.trim(),
          studentId: selectedStudentId,
          caseId,
          status,
        })

        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success("Contact logged and updated in Master Timeline!")
          setNotes("")
          setOpen(false)
          router.refresh()
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to log communication.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2 shadow-xs cursor-pointer">
            <Plus className="h-4 w-4" />
            Log Contact
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Log Communication / Contact</DialogTitle>
                <DialogDescription className="text-xs">
                  Record phone call, email, letter, or in-person discussion with student or guardian.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Student selection */}
            <div className="space-y-1.5">
              <Label htmlFor="studentSelect" className="text-xs font-medium">
                Student Contacted
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
                <Input placeholder="No linked students found." disabled className="text-xs" />
              )}
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="commType" className="text-xs font-medium">
                  Channel / Method
                </Label>
                <select
                  id="commType"
                  value={commType}
                  onChange={(e) => setCommType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="IN_PERSON">In-Person Meeting</option>
                  <option value="EMAIL">Email</option>
                  <option value="LETTER">Written Letter / Notice</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commStatus" className="text-xs font-medium">
                  Outcome Status
                </Label>
                <select
                  id="commStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background"
                >
                  <option value="COMPLETED">Completed / Reached</option>
                  <option value="PENDING">Pending Follow-up / Voicemail</option>
                  <option value="FAILED">Unanswered / Failed</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="contactDate" className="text-xs font-medium">
                Date & Time of Contact
              </Label>
              <Input
                id="contactDate"
                type="datetime-local"
                value={contactDate}
                onChange={(e) => setContactDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="commNotes" className="text-xs font-medium">
                Discussion Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="commNotes"
                placeholder="Detail what was discussed, agreements made, guardian reaction, or next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                className="min-h-[120px] text-xs leading-relaxed"
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
                  Saving Contact...
                </>
              ) : (
                "Save Log"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
