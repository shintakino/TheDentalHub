"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OperatingHour {
  day: number;
  open: string;
  close: string;
  active: boolean;
}

interface OperatingHoursEditorProps {
  value: OperatingHour[];
  onChange: (value: OperatingHour[]) => void;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function OperatingHoursEditor({ value, onChange }: OperatingHoursEditorProps) {
  const handleToggle = (day: number) => {
    const newValue = value.map((oh) => 
      oh.day === day ? { ...oh, active: !oh.active } : oh
    );
    onChange(newValue);
  };

  const handleTimeChange = (day: number, field: "open" | "close", time: string) => {
    const newValue = value.map((oh) => 
      oh.day === day ? { ...oh, [field]: time } : oh
    );
    onChange(newValue);
  };

  // Sort by Monday (1) to Sunday (0)
  const sortedValue = [...value].sort((a, b) => {
    const aDay = a.day === 0 ? 7 : a.day;
    const bDay = b.day === 0 ? 7 : b.day;
    return aDay - bDay;
  });

  return (
    <div className="space-y-3 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
      {sortedValue.map((oh) => (
        <div key={oh.day} className="flex items-center justify-between gap-4 group">
          <div className="flex items-center gap-4 w-32">
            <Switch 
              checked={oh.active} 
              onCheckedChange={() => handleToggle(oh.day)}
              className="data-[state=checked]:bg-primary"
            />
            <span className={cn(
              "font-outfit text-sm transition-colors",
              oh.active ? "text-obsidian font-medium" : "text-slate-400"
            )}>
              {dayNames[oh.day]}
            </span>
          </div>

          <div className={cn(
            "flex items-center gap-3 transition-opacity duration-300",
            oh.active ? "opacity-100" : "opacity-30 pointer-events-none"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Open</span>
              <Input 
                type="time" 
                value={oh.open} 
                onChange={(e) => handleTimeChange(oh.day, "open", e.target.value)}
                className="w-32 h-9 rounded-lg border-slate-200 focus:border-primary px-3 py-1 font-outfit text-sm tabular-nums"
              />
            </div>
            <div className="w-2 h-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Close</span>
              <Input 
                type="time" 
                value={oh.close} 
                onChange={(e) => handleTimeChange(oh.day, "close", e.target.value)}
                className="w-32 h-9 rounded-lg border-slate-200 focus:border-primary px-3 py-1 font-outfit text-sm tabular-nums"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
