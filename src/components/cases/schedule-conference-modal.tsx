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
import { Calendar, Plus, Loader2 } from "lucide-react"
import { scheduleConference } from "@/features/conferences/actions"
import { toast } from "sonner"

interface ScheduleConferenceModalProps {
  caseId: string
  involvedStudents: Array<{
    id: string
    firstName: string
    lastName: string
  }>
}

export function ScheduleConferenceModal({ caseId, involvedStudents }: ScheduleConferenceModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(involvedStudents[0]?.id || "")
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
  const [externalAttendee, setExternalAttendee] = useState("")
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId) {
      toast.error("Please select a student.")
      return
    }

    startTransition(async () => {
      try {
        const attendees: Array<{ type: string; studentId?: string; externalName?: string }> = [
          { type: "STUDENT", studentId: selectedStudentId },
        ]

        if (externalAttendee.trim()) {
          attendees.push({
            type: "EXTERNAL",
            externalName: externalAttendee.trim(),
          })
        }

        const res = await scheduleConference({
          caseId,
          studentId: selectedStudentId,
          scheduledAt: new Date(scheduledAt),
          attendees,
        })

        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success("Conference scheduled and added to Master Timeline & Calendar!")
          setNotes("")
          setExternalAttendee("")
          setOpen(false)
          router.refresh()
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to schedule conference.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2 shadow-xs cursor-pointer">
            <Plus className="h-4 w-4" />
            Schedule Conference
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Schedule Case Conference</DialogTitle>
                <DialogDescription className="text-xs">
                  Set up a formal disciplinary or support conference with student and guardians.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Student */}
            <div className="space-y-1.5">
              <Label htmlFor="studentConfSelect" className="text-xs font-medium">
                Student Involved
              </Label>
              {involvedStudents.length > 0 ? (
                <select
                  id="studentConfSelect"
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

            {/* Scheduled Date */}
            <div className="space-y-1.5">
              <Label htmlFor="confDate" className="text-xs font-medium">
                Conference Date & Time
              </Label>
              <Input
                id="confDate"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Additional Attendees */}
            <div className="space-y-1.5">
              <Label htmlFor="extAttendee" className="text-xs font-medium">
                Other Attendees (Guardian, Counselor, Guidance, etc.)
              </Label>
              <Input
                id="extAttendee"
                placeholder="e.g. Maria Dela Cruz (Mother), Mr. Santos (Guidance Counselor)"
                value={externalAttendee}
                onChange={(e) => setExternalAttendee(e.target.value)}
                className="text-xs"
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
                  Scheduling...
                </>
              ) : (
                "Schedule Conference"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
