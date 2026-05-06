"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface IdentityTabProps {
  clinic: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export function IdentityTab({ clinic }: IdentityTabProps) {
  const [logoUrl, setLogoUrl] = useState(clinic.logoUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/clinics/${clinic.id}/branding/logo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload logo");
      }

      const data = await response.json();
      setLogoUrl(data.logoUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Identity</CardTitle>
        <CardDescription>
          Manage your clinic's logo and basic information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Clinic Logo</Label>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Clinic Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="relative cursor-pointer"
                disabled={isUploading}
                asChild
              >
                <label>
                  <Upload className="h-4 w-4 mr-2" />
                  {logoUrl ? "Change Logo" : "Upload Logo"}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleLogoUpload}
                    accept="image/*"
                    disabled={isUploading}
                  />
                </label>
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, PNG or SVG, max 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinic-name">Clinic Name</Label>
          <Input
            id="clinic-name"
            defaultValue={clinic.name}
            placeholder="Enter clinic name"
            disabled // Name update might be separate or via different API
          />
          <p className="text-xs text-muted-foreground">
            Clinic name is currently managed via organization settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
