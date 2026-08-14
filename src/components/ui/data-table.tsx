"use client"

import {
  useTable,
  createCoreRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  createFilteredRowModel,
  flexRender,
  tableFeatures,
  rowSelectionFeature,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  globalFilteringFeature,
} from "@tanstack/react-table"
import { useState, useEffect } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"

import { EmptyIncidentsIllustration } from "@/components/ui/illustrations"

export const dtFeatures = tableFeatures({
  rowSelectionFeature,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  globalFilteringFeature,
})

export type DTFeatures = typeof dtFeatures

interface DataTableProps<TData extends object> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[]
  data: TData[]
  searchPlaceholder?: string
  pageSize?: number
  onBulkDelete?: (rows: TData[]) => void
}

export function DataTable<TData extends object>({
  columns,
  data,
  searchPlaceholder = "Search...",
  pageSize = 10,
  onBulkDelete,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  })

  useEffect(() => {
    const savedSize = localStorage.getItem("sbmo-table-pageSize")
    if (savedSize && !isNaN(Number(savedSize))) {
      setPagination(prev => ({ ...prev, pageSize: Number(savedSize) }))
    }
  }, [])

  const handlePageSizeChange = (newSize: number) => {
    localStorage.setItem("sbmo-table-pageSize", String(newSize))
    setPagination(prev => ({ ...prev, pageSize: newSize, pageIndex: 0 }))
  }

   
  const table = useTable({
    _features: dtFeatures,
    columns,
    data,
    _rowModels: {
      Core: createCoreRowModel(),
      Sorted: createSortedRowModel(),
      Paginated: createPaginatedRowModel(),
      Filtered: createFilteredRowModel(),
    },
    state: { 
      globalFilter,
      pagination
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
  } as any)

  // Row selection count via state (v9 doesn't have getFilteredSelectedRowModel)
  const selectedCount = Object.keys((table as any).state.rowSelection || {}).length
  const hasSelection = selectedCount > 0

  const allRows = (table as any).getRowModel?.()?.rows || []
  const isPaginated = allRows.length <= pagination.pageSize && allRows.length < data.length
  const displayRows = isPaginated 
    ? allRows 
    : allRows.slice(pagination.pageIndex * pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-xl border border-border bg-card/60 px-3.5 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all duration-200 shadow-2xs"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span aria-live="polite" className="sr-only">
            {(table as any).getFilteredRowModel?.().rows.length ?? 0} results found
          </span>
          <span aria-hidden="true" className="font-medium">{(table as any).getFilteredRowModel?.().rows.length ?? 0} rows</span>
          <select
            value={pagination.pageSize}
            onChange={e => handlePageSizeChange(Number(e.target.value))}
            className="h-9 rounded-xl border border-border bg-card/60 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring font-medium"
          >
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 backdrop-blur-md"
          >
            <span className="text-xs font-semibold text-primary">
              {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => (table as any).resetRowSelection?.()} className="h-7 text-xs">
                Deselect all
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl border border-border/80 overflow-hidden glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b border-border">
              {(table as any).getHeaderGroups?.()?.map((headerGroup: any) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => {
                    const canSort = header.column.getCanSort?.() ?? false
                    const isSorted = header.column.getIsSorted?.() ?? false

                    return (
                      <th
                        key={header.id}
                        className="h-10 px-4 text-left align-middle font-bold text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px]"
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            onClick={header.column.getToggleSortingHandler?.()}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                              {isSorted === "asc" ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : isSorted === "desc" ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5" />
                              )}
                            </span>
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <EmptyIncidentsIllustration width={130} height={90} className="mb-2 opacity-80" />
                    <p className="text-xs font-semibold text-foreground">No records match criteria.</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                displayRows.map((row: any) => {
                  const cells = row.getAllCells?.() || []
                  
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-colors duration-150 group",
                        "hover:bg-muted/50",
                        row.getIsSelected?.() && "bg-primary/5"
                      )}
                    >
                      {cells.map((cell: any) => (
                        <td key={cell.id} className="px-4 py-3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext?.())}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {pagination.pageIndex + 1} of {Math.max(1, Math.ceil(allRows.length / pagination.pageSize))}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
            disabled={pagination.pageIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(5, Math.max(1, Math.ceil(allRows.length / pagination.pageSize))) }, (_, i) => {
            const active = pagination.pageIndex === i
            return (
              <button
                key={i}
                onClick={() => (table as any).setPageIndex?.(i)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent"
                )}
              >
                {i + 1}
              </button>
            )
          })}
          <button
            onClick={() => setPagination(p => ({ ...p, pageIndex: Math.min(Math.ceil(allRows.length / pagination.pageSize) - 1, p.pageIndex + 1) }))}
            disabled={pagination.pageIndex >= Math.ceil(allRows.length / pagination.pageSize) - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
