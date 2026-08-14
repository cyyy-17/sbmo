"use client"

import { useState, useRef, useTransition } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Search,
  FileCheck,
  UserCheck,
} from "lucide-react"
import {
  downloadIncidentExcelTemplate,
  parseIncidentExcelFile,
  type ParsedIncidentRecord,
} from "@/lib/excel-template"
import { importIncidentsFromExcel } from "@/features/incidents/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function IncidentImportModal() {
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [records, setRecords] = useState<ParsedIncidentRecord[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isImporting, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const validRecords = records.filter((r) => r.isValid)
  const invalidRecords = records.filter((r) => !r.isValid)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsParsing(true)
    try {
      const parsed = await parseIncidentExcelFile(file)
      setRecords(parsed)
      if (parsed.length === 0) {
        toast.warning("The selected spreadsheet does not contain any data rows.")
      } else {
        const validCount = parsed.filter((r) => r.isValid).length
        toast.info(`Parsed ${parsed.length} row(s) — ${validCount} valid and ready for import.`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to read Excel file. Please ensure it is a valid .xlsx or .xls file.")
      setRecords([])
      setFileName(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload an Excel spreadsheet (.xlsx, .xls) or CSV file.")
      return
    }

    setFileName(file.name)
    setIsParsing(true)
    try {
      const parsed = await parseIncidentExcelFile(file)
      setRecords(parsed)
      const validCount = parsed.filter((r) => r.isValid).length
      toast.info(`Parsed ${parsed.length} row(s) — ${validCount} valid.`)
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to parse file.")
      setRecords([])
      setFileName(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleClear = () => {
    setFileName(null)
    setRecords([])
    setSearchQuery("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImport = () => {
    if (validRecords.length === 0) {
      toast.error("No valid incident records to import.")
      return
    }

    startTransition(async () => {
      try {
        const result = await importIncidentsFromExcel(validRecords)
        if (result.success) {
          toast.success(
            `Successfully imported ${result.importedCount} incident(s) and auto-registered involved student(s)!`
          )
          if (result.errors.length > 0) {
            toast.warning(`${result.errors.length} row(s) encountered warnings/errors during processing.`)
          }
          handleClear()
          setOpen(false)
          router.refresh()
        } else {
          toast.error(result.errors?.[0] || "Import failed.")
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred during import.")
      }
    })
  }

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      r.studentId.toLowerCase().includes(q) ||
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.severity.toLowerCase().includes(q) ||
      r.involvementType.toLowerCase().includes(q)
    )
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="gap-2 border-primary/20 hover:bg-primary/5 active:scale-[0.97] transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Import Excel
          </Button>
        }
      />
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Import Incidents from Excel</DialogTitle>
                <DialogDescription className="text-xs">
                  Upload spreadsheet of incidents. Involved students will be automatically registered in the Student Directory.
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadIncidentExcelTemplate}
              className="gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5"
            >
              <Download className="h-3.5 w-3.5" />
              Download Format Template
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 custom-scrollbar">
          {/* Upload Area */}
          {!fileName ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="h-14 w-14 rounded-2xl bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors">
                <UploadCloud className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Click to browse or drag and drop spreadsheet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV format
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground/80">
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-blue-500" /> Auto-registers students
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FileCheck className="h-3.5 w-3.5 text-emerald-500" /> Creates incident references
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    XLSX
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate max-w-sm">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {records.length} total rows parsed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" /> {validRecords.length} Ready
                  </Badge>
                  {invalidRecords.length > 0 && (
                    <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 gap-1 text-xs">
                      <AlertCircle className="h-3 w-3" /> {invalidRecords.length} With Errors
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleClear}
                    title="Remove file"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search filter if records exist */}
              {records.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search parsed records by student, incident title, severity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="border rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 sticky top-0 backdrop-blur-md border-b text-[11px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-12">Row</th>
                      <th className="py-2.5 px-3">Incident Title</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Student (Auto-Register)</th>
                      <th className="py-2.5 px-3">Involvement</th>
                      <th className="py-2.5 px-3 w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isParsing ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                          Parsing spreadsheet rows...
                        </td>
                      </tr>
                    ) : filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-muted-foreground">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((row) => (
                        <tr
                          key={row.rowIndex}
                          className={cn(
                            "hover:bg-muted/30 transition-colors",
                            !row.isValid && "bg-red-500/5"
                          )}
                        >
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">
                            #{row.rowIndex}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            <span className="line-clamp-1">{row.title || <i className="text-muted-foreground">Missing title</i>}</span>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                            {row.dateOfIncident}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase font-semibold",
                                row.severity === "CRITICAL" && "border-red-500/30 bg-red-500/10 text-red-600",
                                row.severity === "MAJOR" && "border-orange-500/30 bg-orange-500/10 text-orange-600",
                                row.severity === "MINOR" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-700"
                              )}
                            >
                              {row.severity}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <div>
                              <p className="font-semibold text-foreground">
                                {row.lastName}, {row.firstName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                ID: {row.studentId || "None"}
                              </p>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {row.involvementType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {row.isValid ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] gap-1 font-semibold">
                                <CheckCircle2 className="h-3 w-3" /> Valid
                              </Badge>
                            ) : (
                              <div className="space-y-0.5">
                                <Badge variant="destructive" className="text-[10px] gap-1 font-semibold">
                                  <AlertCircle className="h-3 w-3" /> Invalid
                                </Badge>
                                <p className="text-[10px] text-red-600 dark:text-red-400 line-clamp-1" title={row.errors.join("; ")}>
                                  {row.errors[0]}
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button
            variant="outline"
            onClick={() => {
              handleClear()
              setOpen(false)
            }}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validRecords.length === 0 || isImporting}
            className="gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing & Registering Students...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Import {validRecords.length} Incident{validRecords.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
