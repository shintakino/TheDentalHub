"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema, BranchPayload } from "@/lib/validations";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { OperatingHoursEditor } from "./OperatingHoursEditor";

import { BranchMapPreview } from "./BranchMapPreview";
import { Switch } from "@/components/ui/switch";

import { branches } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Branch = InferSelectModel<typeof branches>;

interface BranchFormProps {
  tenantId: string;
  initialData?: Branch;
  onSuccess: () => void;
}

const defaultOperatingHours = [
  { day: 1, open: "09:00", close: "17:00", active: true },
  { day: 2, open: "09:00", close: "17:00", active: true },
  { day: 3, open: "09:00", close: "17:00", active: true },
  { day: 4, open: "09:00", close: "17:00", active: true },
  { day: 5, open: "09:00", close: "17:00", active: true },
  { day: 6, open: "09:00", close: "13:00", active: false },
  { day: 0, open: "09:00", close: "13:00", active: false },
];

export function BranchForm({ tenantId, initialData, onSuccess }: BranchFormProps) {
  const form = useForm<BranchPayload>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      address: initialData.address || "",
      timezone: initialData.timezone,
      operatingHours: initialData.operatingHours,
      maxCapacity: initialData.maxCapacity ?? 1,
      isActive: initialData.isActive ?? true,
    } : {
      name: "",
      address: "",
      timezone: "UTC",
      operatingHours: defaultOperatingHours,
      maxCapacity: 1,
      isActive: true,
    },
  });

  const address = form.watch("address");

  const onSubmit = async (values: BranchPayload) => {
    try {
      const url = initialData 
        ? `/api/branches/${initialData.id}`
        : `/api/clinics/${tenantId}/branches`;
      
      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save branch");
      }

      toast.success(initialData ? "Branch configuration updated" : "New branch registered");
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save branch";
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="space-y-0.5">
            <FormLabel className="text-base font-outfit text-obsidian">Branch Status</FormLabel>
            <p className="text-sm text-slate-500 font-outfit">Allow this branch to accept appointments.</p>
          </div>
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-outfit text-slate-600">Branch Name</FormLabel>
                <FormControl>
                  <Input placeholder="Downtown Clinic" className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-outfit text-slate-600">Physical Capacity (Chairs)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-outfit text-slate-600">Timezone</FormLabel>
                <FormControl>
                  <Input placeholder="UTC" className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-outfit text-slate-600">Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Dental St, Medical District" className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <BranchMapPreview address={address || ""} />
        </div>

        <div className="space-y-4">
          <FormLabel className="font-outfit text-slate-600">Operating Hours</FormLabel>
          <FormField
            control={form.control}
            name="operatingHours"
            render={({ field }) => (
              <FormControl>
                <OperatingHoursEditor 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              </FormControl>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onSuccess} className="rounded-xl h-11 px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-8 min-w-[120px]">
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Update Branch" : "Create Branch")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
