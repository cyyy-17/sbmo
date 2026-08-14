import { getViolationCategories } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Trash2, Layers } from "lucide-react"
import { CategoryModal } from "@/components/settings/category-modal"
import { TypeModal } from "@/components/settings/type-modal"
import { EmptyIncidentsIllustration } from "@/components/ui/illustrations"

export const dynamic = "force-dynamic"

export default async function ViolationsSettingsPage() {
  const categories = await getViolationCategories()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Violation Categories</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage the taxonomy of behavioral violations and their severity classification.
          </p>
        </div>
        <CategoryModal />
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center p-14 border rounded-3xl border-dashed bg-card/40 backdrop-blur-md space-y-4">
            <EmptyIncidentsIllustration width={150} height={110} />
            <div>
              <h3 className="text-base font-bold text-foreground">No Categories Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Create your first violation category (e.g., Bullying, Academic Dishonesty, Dress Code) to get started.
              </p>
            </div>
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="glass-card shadow-xs">
              <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription className="text-xs mt-0.5">{category.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Violation Types ({category.types.length})
                    </h4>
                    <TypeModal categoryId={category.id} />
                  </div>
                  
                  {category.types.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic p-3 bg-muted/20 rounded-xl border border-dashed text-center">
                      No specific violation types defined for this category. Click "+ Add Type" above.
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {category.types.map((type) => (
                        <div
                          key={type.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 text-xs bg-background/60 hover:bg-card hover:border-primary/30 transition-all duration-150 shadow-2xs"
                        >
                          <span className="font-semibold text-foreground">{type.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                type.severity === "CRITICAL"
                                  ? "destructive"
                                  : type.severity === "MAJOR"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.2"
                            >
                              {type.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
