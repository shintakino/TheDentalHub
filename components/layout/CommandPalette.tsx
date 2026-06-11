"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Command } from "cmdk"
import { Search, Building2, User, FileText, ArrowRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { SearchResult } from "@/lib/admin/search"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const router = useRouter()
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const { data: results, isLoading } = useSWR<SearchResult[]>(
    open && query ? `/api/clinics/${tenantSlug}/search?q=${query}` : null,
    fetcher
  )

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const onSelect = React.useCallback((href: string) => {
    setOpen(false)
    router.push(href.replace("[tenantSlug]", tenantSlug))
    setQuery("")
  }, [router, tenantSlug])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl ring-1 ring-black/5 sm:max-w-lg" showCloseButton={false}>
        <Command className="flex h-full w-full flex-col overflow-hidden bg-popover rounded-xl">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search branches, staff, or modules... (Cmd+K)"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={query}
              onValueChange={setQuery}
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            
            {Array.isArray(results) && results.length > 0 && (
              <Command.Group heading="Search Results" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                {results.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.title}
                    onSelect={() => onSelect(item.href)}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                  >
                    {item.type === "branch" && <Building2 className="mr-2 h-4 w-4 text-primary" />}
                    {item.type === "staff" && <User className="mr-2 h-4 w-4 text-primary" />}
                    {item.type === "page" && <FileText className="mr-2 h-4 w-4 text-primary" />}
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {!query && (
              <Command.Group heading="Quick Actions" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                <Command.Item onSelect={() => onSelect("/manage/[tenantSlug]/dashboard")} className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Go to Dashboard</span>
                </Command.Item>
                <Command.Item onSelect={() => onSelect("/manage/[tenantSlug]/schedule")} className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>View Schedule</span>
                </Command.Item>
                <Command.Item onSelect={() => onSelect("/manage/[tenantSlug]/inventory")} className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Manage Inventory</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>
          <div className="flex items-center justify-between border-t bg-muted/50 px-3 py-2 text-[10px] text-muted-foreground">
            <div className="flex gap-2">
              <span><kbd className="font-sans">↑↓</kbd> to navigate</span>
              <span><kbd className="font-sans">↵</kbd> to select</span>
            </div>
            <span><kbd className="font-sans">esc</kbd> to close</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
