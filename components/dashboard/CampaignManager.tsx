"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Megaphone, Calendar, Tag, Link as LinkIcon, BarChart3, Trash2, Copy } from "lucide-react";
import { Campaign, Service } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CampaignWithService extends Campaign {
  service: Service | null;
}

interface CampaignStats {
  totalBookings: number;
  totalRevenue: number;
  completedBookings: number;
  conversionRate: number;
}

export function CampaignManager({ tenantId }: { tenantId: string }) {
  const [campaigns, setCampaigns] = useState<CampaignWithService[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [stats, setStats] = useState<Record<string, CampaignStats>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft" as string,
    discountType: "none" as string,
    discountValue: "0.00",
    serviceId: "",
    trackingCode: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, servicesRes] = await Promise.all([
        fetch(`/api/clinics/${tenantId}/campaigns`),
        fetch(`/api/clinics/${tenantId}/services`)
      ]);
      
      if (!campaignsRes.ok || !servicesRes.ok) throw new Error();

      const campaignsData = await campaignsRes.json();
      const servicesData = await servicesRes.json();
      
      setCampaigns(campaignsData);
      setServices(servicesData);

      // Fetch stats for each campaign
      campaignsData.forEach(async (c: Campaign) => {
        const statsRes = await fetch(`/api/clinics/${tenantId}/campaigns/${c.id}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(prev => ({ ...prev, [c.id]: statsData }));
        }
      });
    } catch (error) {
      toast.error("Failed to load marketing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        serviceId: formData.serviceId === "all" || !formData.serviceId ? null : formData.serviceId,
        trackingCode: formData.trackingCode || formData.name.toUpperCase().replace(/\s+/g, "_")
      };

      const res = await fetch(`/api/clinics/${tenantId}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error();
      
      toast.success("Campaign created successfully");
      setIsCreateOpen(false);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "draft",
        discountType: "none",
        discountValue: "0.00",
        serviceId: "",
        trackingCode: ""
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`/api/clinics/${tenantId}/campaigns/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error();
      toast.success("Campaign deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const copyBookingLink = (trackingCode: string) => {
    const url = `${window.location.origin}/booking/${tenantId}?c=${trackingCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Booking link copied to clipboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "completed": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      case "draft": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-playfair font-bold">Marketing Intelligence</h2>
          <p className="text-muted-foreground font-outfit">Create and track bespoke campaigns to drive patient acquisition.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90 rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse h-64 bg-slate-50 border-none rounded-3xl" />
          ))
        ) : campaigns.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Megaphone className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-outfit">No campaigns found. Start your first marketing initiative.</p>
          </div>
        ) : (
          campaigns.map(campaign => {
            const campaignStats = stats[campaign.id];
            return (
              <Card key={campaign.id} className="border-none shadow-xl bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={cn("rounded-full font-outfit px-3", getStatusColor(campaign.status))}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive rounded-full" onClick={() => handleDelete(campaign.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="font-playfair text-xl leading-tight">{campaign.name}</CardTitle>
                  <p className="text-sm text-slate-500 font-outfit line-clamp-2 mt-1">{campaign.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 font-outfit">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{format(new Date(campaign.startDate), "MMM d")} - {format(new Date(campaign.endDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>{campaign.service?.name || "All Services"}</span>
                    {campaign.discountType !== "none" && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full border-none">
                        {campaign.discountType === "percentage" ? `${campaign.discountValue}% Off` : `$${campaign.discountValue} Off`}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Bookings</p>
                      <p className="text-lg font-bold text-foreground">{campaignStats?.totalBookings || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Revenue</p>
                      <p className="text-lg font-bold text-foreground">${campaignStats?.totalRevenue.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-4 gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full border-slate-200" onClick={() => copyBookingLink(campaign.trackingCode)}>
                    <Copy className="mr-2 h-3.5 w-3.5" /> Link
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-full border-slate-200">
                    <BarChart3 className="mr-2 h-3.5 w-3.5" /> Stats
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl">Create Marketing Campaign</DialogTitle>
            <DialogDescription className="font-outfit">Define a new initiative to attract patients.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 font-outfit">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Summer Whitening Special" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Tracking Code (Optional)</Label>
                <Input 
                  id="trackingCode" 
                  placeholder="WHITENING2024" 
                  value={formData.trackingCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingCode: e.target.value.toUpperCase() }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Briefly describe the campaign goals and offer details..." 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="rounded-xl border-slate-200 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Service</Label>
                <Select value={formData.serviceId} onValueChange={(val) => setFormData(prev => ({ ...prev, serviceId: val as string }))}>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Select value={formData.discountType} onValueChange={(val) => setFormData(prev => ({ ...prev, discountType: val as string }))}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input 
                    type="number" 
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    disabled={formData.discountType === "none"}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="font-outfit">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={handleCreate} className="rounded-full px-8">Launch Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
