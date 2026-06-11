"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation"
import { Building2, ChevronDown, Check, AlertCircle } from "lucide-react"
import useSWR from "swr"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BranchStatus } from "@/app/api/clinics/[id]/branches/status/route"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function BranchSwitcher() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const tenantSlug = params.tenantSlug as string
  const branchSlug = params.branchSlug as string | undefined

  const { data: branches, error, isLoading } = useSWR<BranchStatus[]>(
    tenantSlug ? `/api/clinics/${tenantSlug}/branches/status` : null,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )

  const activeBranch = Array.isArray(branches) && branchSlug
    ? branches.find((b) => b.slug === branchSlug)
    : undefined

  const currentBranchId = activeBranch ? activeBranch.id : "all"

  const onSelect = (slug: string) => {
    let pageType = "overview";
    if (pathname.includes("/schedule")) {
      pageType = "schedule";
    } else if (pathname.includes("/inventory")) {
      pageType = "inventory";
    }

    if (slug === "all") {
      router.push(`/manage/${tenantSlug}/${pageType}`);
    } else {
      router.push(`/manage/${tenantSlug}/branch/${slug}/${pageType}`);
    }
  }

  if (isLoading && !branches) {
    return (
      <Button variant="ghost" size="sm" className="h-9 gap-2 px-2" disabled>
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 px-3 bg-muted/50 hover:bg-muted font-medium text-xs rounded-full border border-transparent hover:border-border"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate max-w-[120px]">
              {activeBranch ? activeBranch.name : "All Branches"}
            </span>
            {activeBranch && (
              <div className={cn(
                "h-2 w-2 rounded-full",
                activeBranch.status === "open" && "bg-emerald-500",
                activeBranch.status === "emergency" && "bg-red-500 animate-pulse",
                activeBranch.status === "near_capacity" && "bg-amber-500",
                activeBranch.status === "closed" && "bg-slate-400"
              )} />
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            Switch Branch
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => onSelect("all")}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>All Branches</span>
            </div>
            {currentBranchId === "all" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {Array.isArray(branches) && branches.map((branch) => (
            <DropdownMenuItem
              key={branch.id}
              onClick={() => onSelect(branch.slug)}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  branch.status === "open" && "bg-emerald-500",
                  branch.status === "emergency" && "bg-red-500 animate-pulse",
                  branch.status === "near_capacity" && "bg-amber-500",
                  branch.status === "closed" && "bg-slate-400"
                )} />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{branch.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {branch.activeAppointments} patients active
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {branch.hasLowStock && <AlertCircle className="h-3 w-3 text-amber-500" />}
                {currentBranchId === branch.id && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {Array.isArray(branches) && branches.length > 0 && (
           <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground px-2 py-1">
              Quick Stats
            </DropdownMenuLabel>
            <div className="p-2 grid grid-cols-2 gap-2">
              <div className="bg-muted/50 p-1.5 rounded text-center">
                 <div className="text-[10px] text-muted-foreground">Total Active</div>
                 <div className="text-sm font-bold">
                   {branches.reduce((acc, b) => acc + b.activeAppointments, 0)}
                 </div>
              </div>
              <div className="bg-muted/50 p-1.5 rounded text-center">
                 <div className="text-[10px] text-muted-foreground">Alerts</div>
                 <div className="text-sm font-bold text-amber-500">
                   {branches.filter(b => b.hasLowStock || b.status === 'emergency').length}
                 </div>
              </div>
            </div>
           </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
