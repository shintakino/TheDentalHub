"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-1");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-2");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-slate-100 bg-white">
      <span className="text-xs text-slate-500 font-outfit">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-700">
          {Math.min(currentPage * pageSize, totalCount)}
        </span>{" "}
        of <span className="font-semibold text-slate-700">{totalCount}</span> entries
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </Button>

        {pageNumbers.map((page, index) => {
          if (typeof page === "string") {
            return (
              <div
                key={`ellipsis-${index}`}
                className="h-8 w-8 flex items-center justify-center text-slate-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              onClick={() => handlePageClick(page)}
              className={`h-8 w-8 text-xs font-medium font-outfit rounded-lg transition-all ${
                isActive
                  ? "bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/10"
                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </Button>
      </div>
    </div>
  );
}
