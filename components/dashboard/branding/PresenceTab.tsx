"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Globe, Save } from "lucide-react";

interface PresenceTabProps {
  clinic: {
    id: string;
    subdomain: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  };
}

export function PresenceTab({ clinic }: PresenceTabProps) {
  const [subdomain, setSubdomain] = useState(clinic.subdomain || "");
  const [seoTitle, setSeoTitle] = useState(clinic.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(clinic.seoDescription || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clinics/${clinic.id}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: subdomain || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save presence settings");
      }

      toast.success("Presence settings saved");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save presence settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Web Presence</CardTitle>
          <CardDescription>
            Configure your clinic's public-facing web address and SEO metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subdomain">Custom Subdomain</Label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 flex items-center bg-muted/50 rounded-lg border focus-within:ring-1 focus-within:ring-primary">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="border-none bg-transparent focus-visible:ring-0"
                  placeholder="your-clinic"
                />
                <span className="pr-3 text-sm font-medium text-muted-foreground">
                  .thedentalhub.com
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your patient booking page will be accessible at this address.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. Smile Dental Clinic | Best Dental Care in City"
            />
            <p className="text-xs text-muted-foreground">
              This title appears in browser tabs and search engine results (max 60 characters).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">SEO Description</Label>
            <Textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Tell patients why they should choose your clinic..."
              className="h-24 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              A brief summary that appears in search results (max 160 characters).
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Presence
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
