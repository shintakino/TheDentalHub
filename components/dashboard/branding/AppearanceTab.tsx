"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface AppearanceTabProps {
  clinic: {
    id: string;
    primaryColor: string;
    secondaryColor: string | null;
  };
}

export function AppearanceTab({ clinic }: AppearanceTabProps) {
  const [primaryColor, setPrimaryColor] = useState(clinic.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(clinic.secondaryColor || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clinics/${clinic.id}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor,
          secondaryColor: secondaryColor || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save appearance");
      }

      toast.success("Appearance settings saved");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save appearance");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            Customize the colors of your patient-facing booking page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 p-1"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#0047FF"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Main brand color used for buttons and highlights.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor || "#F1F5F9"}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-12 p-1"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#F1F5F9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Used for backgrounds and subtle accents.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Appearance
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your colors will look on the booking page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 rounded-xl border bg-background space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <Button
              className="w-full"
              style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
            >
              Book Appointment
            </Button>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: secondaryColor || "#F1F5F9" }}
            >
              <p className="text-xs font-medium">Secondary Background Example</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
