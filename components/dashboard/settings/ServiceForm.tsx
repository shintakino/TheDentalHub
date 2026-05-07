"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, ServicePayload } from "@/lib/validations";
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

import { services } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Service = InferSelectModel<typeof services>;

interface ServiceFormProps {
  tenantId: string;
  initialData?: Service;
  onSuccess: () => void;
}

export function ServiceForm({ tenantId, initialData, onSuccess }: ServiceFormProps) {
  const form = useForm<ServicePayload>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      duration: initialData.duration,
      price: initialData.price,
    } : {
      name: "",
      duration: 30,
      price: "0.00",
    },
  });

  const onSubmit = async (values: ServicePayload) => {
    try {
      const url = initialData 
        ? `/api/clinics/${tenantId}/services/${initialData.id}`
        : `/api/clinics/${tenantId}/services`;
      
      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save service");
      }

      toast.success(initialData ? "Service updated" : "Service created");
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save service";
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-outfit text-slate-600">Service Name</FormLabel>
              <FormControl>
                <Input placeholder="General Consultation" className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-outfit text-slate-600">Duration (minutes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="30" 
                  className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all tabular-nums" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-outfit text-slate-600">Base Price ($)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="0.00" 
                  className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all tabular-nums" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onSuccess} className="rounded-xl h-11 px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-8 min-w-[120px]">
            {form.formState.isSubmitting ? "Saving..." : (initialData ? "Update Service" : "Create Service")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
