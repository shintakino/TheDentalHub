"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface Branch {
  id: string;
  name: string;
}

export function BranchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const currentBranchId = searchParams.get("branchId") || "all";

  useEffect(() => {
    async function fetchBranches() {
      try {
        // Extract tenantSlug from pathname /manage/[tenantSlug]/...
        const parts = pathname.split("/");
        const manageIdx = parts.indexOf("manage");
        if (manageIdx !== -1 && parts[manageIdx + 1]) {
          const tenantSlug = parts[manageIdx + 1];
          const response = await fetch(`/api/clinics/${tenantSlug}/branches`);
          if (response.ok) {
            const data = await response.json();
            setBranches(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches for filter:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBranches();
  }, [pathname]);

  const handleBranchChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("branchId");
    } else {
      params.set("branchId", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (loading || branches.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-slate-400" />
      <Select value={currentBranchId} onValueChange={handleBranchChange}>
        <SelectTrigger className="w-[180px] h-9 text-xs font-outfit border-none shadow-none bg-slate-50 hover:bg-slate-100 transition-colors">
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All Branches</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id} className="text-xs">
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
