"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { clinicOnboardingSchema } from "@/lib/validations";

export default function ClinicOnboardingPage() {
  const { createOrganization, setActive } = useOrganizationList();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof clinicOnboardingSchema>>({
    resolver: zodResolver(clinicOnboardingSchema),
    defaultValues: {
      clinicName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof clinicOnboardingSchema>) {
    if (!createOrganization) return;
    
    setIsLoading(true);
    try {
      const organization = await createOrganization({ name: values.clinicName });
      
      if (setActive) {
        await setActive({ organization: organization.id });
      }
      
      toast.success("Clinic created successfully!");
      // Redirect to the settings page
      router.push(`/manage/${organization.id}/settings`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.errors?.[0]?.longMessage || "Failed to create clinic. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to DentalHub</CardTitle>
          <CardDescription>
            Let's set up your clinic workspace. What is the name of your clinic?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Smile Dental Care" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Clinic"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
