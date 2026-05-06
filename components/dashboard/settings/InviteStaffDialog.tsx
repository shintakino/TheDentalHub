"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteStaffSchema, InviteStaffPayload } from "@/lib/validations";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface InviteStaffDialogProps {
  tenantId: string;
  onSuccess: () => void;
}

export function InviteStaffDialog({ tenantId, onSuccess }: InviteStaffDialogProps) {
  const form = useForm<InviteStaffPayload>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: "",
      role: "dentist",
      name: "",
    },
  });

  const onSubmit = async (values: InviteStaffPayload) => {
    try {
      const response = await fetch(`/api/clinics/${tenantId}/staff/invite`, {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invitation");
      }

      toast.success("Invitation sent successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
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
              <FormLabel className="font-outfit text-slate-600">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Dr. John Smith" className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-outfit text-slate-600">Email Address</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" type="email" className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-outfit text-slate-600">Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200 focus:border-primary transition-all">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="dentist">Dentist</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onSuccess} className="rounded-xl h-11 px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-8 min-w-[150px]">
            {form.formState.isSubmitting ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
