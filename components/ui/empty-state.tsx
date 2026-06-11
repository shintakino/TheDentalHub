"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 min-h-[320px] rounded-2xl border-2 border-dashed border-slate-100 bg-white/50 backdrop-blur-sm",
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/5/20 animate-pulse-subtle">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="font-outfit text-lg font-semibold text-slate-800 mb-1.5">
        {title}
      </h3>
      <p className="font-outfit text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex items-center justify-center">{action}</div>}
    </div>
  );
}
