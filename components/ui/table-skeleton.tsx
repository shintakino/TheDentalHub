import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columnsCount?: number;
  rowsCount?: number;
}

export function TableSkeleton({
  columnsCount = 5,
  rowsCount = 5,
}: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border-transparent">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            {Array.from({ length: columnsCount }).map((_, i) => (
              <TableHead key={i} className="py-6 px-8">
                <Skeleton className="h-4 w-24 bg-slate-200" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowsCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-slate-100 hover:bg-transparent">
              {Array.from({ length: columnsCount }).map((_, colIndex) => (
                <TableCell key={colIndex} className="py-6 px-8">
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
                      <Skeleton className="h-4 w-32 bg-slate-100" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-20 bg-slate-100" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
