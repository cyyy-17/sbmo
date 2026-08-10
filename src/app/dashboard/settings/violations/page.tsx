import { getViolationCategories } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Edit, Trash2 } from "lucide-react"
import { CategoryModal } from "@/components/settings/category-modal"
import { TypeModal } from "@/components/settings/type-modal"

export default async function ViolationsSettingsPage() {
  const categories = await getViolationCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium tracking-tight">Violation Categories</h3>
          <p className="text-sm text-muted-foreground">
            Manage the taxonomy of behavioral violations and their severities.
          </p>
        </div>
        <CategoryModal />
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted/20 border-dashed">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No Categories Found</h3>
            <p className="text-sm text-muted-foreground">
              Create your first violation category to get started.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription className="mt-1">{category.description}</CardDescription>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Violation Types</h4>
                    <TypeModal categoryId={category.id} />
                  </div>
                  
                  {category.types.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">No types defined for this category.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {category.types.map(type => (
                        <div key={type.id} className="flex items-center justify-between p-2 rounded-md border text-sm bg-card hover:bg-accent/50 transition-colors">
                          <span className="font-medium">{type.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={type.severity === 'CRITICAL' ? 'destructive' : type.severity === 'MAJOR' ? 'secondary' : 'outline'} className="text-[10px]">
                              {type.severity}
                            </Badge>
                            <button className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
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
