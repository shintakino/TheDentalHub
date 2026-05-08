"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ShieldCheck, ShieldAlert } from "lucide-react";

interface GeneralSettingsTabProps {
  tenantId: string;
  initialMode: "manual" | "auto";
  clinicId: string;
}

export function GeneralSettingsTab({ tenantId, initialMode, clinicId }: GeneralSettingsTabProps) {
  const [mode, setMode] = useState<"manual" | "auto">(initialMode);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (newMode: "manual" | "auto") => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingApprovalMode: newMode }),
      });

      if (!res.ok) throw new Error("Failed to update settings");

      setMode(newMode);
      toast.success(`Booking mode updated to ${newMode === 'auto' ? 'Automatic' : 'Manual'} approval`);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-obsidian mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="font-playfair text-xl">Booking Approval Workflow</CardTitle>
          </div>
          <CardDescription className="font-outfit text-slate-500">
            Configure how new patient bookings are processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-start justify-between gap-4 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="space-y-1">
              <Label className="text-lg font-outfit font-semibold text-obsidian flex items-center gap-2">
                Automatic Approval
                {mode === "auto" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                )}
              </Label>
              <p className="text-sm text-slate-500 font-outfit leading-relaxed max-w-md">
                When enabled, all new bookings will be automatically confirmed. When disabled, bookings will remain in a "Pending Approval" state until manually reviewed.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              <Switch 
                checked={mode === "auto"} 
                onCheckedChange={(checked) => handleSave(checked ? "auto" : "manual")}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border-2 transition-all ${mode === 'manual' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}>
              <h4 className="font-outfit font-bold text-obsidian mb-1">Manual Mode (Recommended)</h4>
              <p className="text-xs text-slate-500">Full control. You review every appointment before it is finalized. Best for busy clinics with complex staffing.</p>
            </div>
            <div className={`p-4 rounded-xl border-2 transition-all ${mode === 'auto' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}>
              <h4 className="font-outfit font-bold text-obsidian mb-1">Automatic Mode</h4>
              <p className="text-xs text-slate-500">Frictionless booking. Slots are confirmed instantly. Best for clinics with high availability and automated slot generation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
