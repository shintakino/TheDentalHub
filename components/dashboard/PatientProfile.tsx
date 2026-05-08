"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  CalendarDays, 
  Mail, 
  Phone, 
  Clock, 
  FileText, 
  MessageSquare, 
  Star, 
  Award,
  History,
  Settings,
  ChevronRight,
  Loader2,
  Plus,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AppointmentHistory {
  id: string;
  startTime: string;
  status: string;
  serviceName: string;
  branchName: string;
  actualPrice: string | null;
}

interface ClinicalNote {
  id: string;
  content: string;
  createdAt: string;
  dentistId: string;
  appointmentId: string;
}

interface CommunicationLog {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject: string | null;
  status: string;
  createdAt: string;
  templateName: string;
}

interface LoyaltyTransaction {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface PatientDetails {
  profile: {
    id: string;
    userId: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    loyaltyPoints: number;
    preferences: { email_marketing: boolean; sms_reminders: boolean };
  } | null;
  stats: {
    name: string;
    email: string;
    totalVisits: number;
    noShows: number;
    lifetimeValue: number;
    lastVisit: string | null;
  };
  history: AppointmentHistory[];
  notes: ClinicalNote[];
  communications: CommunicationLog[];
  loyalty: LoyaltyTransaction[];
}

export function PatientProfile({ patientId }: { patientId: string }) {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [details, setDetails] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clinics/${tenantSlug}/patients/${patientId}`);
      if (!response.ok) throw new Error("Failed to fetch patient details");
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="font-outfit text-slate-500 text-lg">Loading patient command center...</p>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-transparent font-outfit px-3 py-1">
              Active Patient
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-transparent font-outfit px-3 py-1">
              {details.stats.noShows > 0 ? `${details.stats.noShows} No-Shows` : "Reliable Patient"}
            </Badge>
          </div>
          <h1 className="text-5xl font-playfair font-bold text-obsidian tracking-tight">
            {details.stats.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-500 font-outfit">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {details.stats.email || "No email provided"}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {details.profile?.phone || "No phone provided"}
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              {details.profile?.loyaltyPoints || 0} Loyalty Points
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-transparent bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-outfit">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-[0_4px_20px_rgba(0,71,255,0.2)] font-outfit">
            <CalendarDays className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start h-auto p-0 rounded-none gap-8">
          {["overview", "history", "records", "communications", "settings"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="px-0 py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none font-outfit text-base font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-2 duration-400">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2">
              <p className="font-outfit text-sm text-slate-500">Total Visits</p>
              <p className="text-3xl font-playfair font-bold text-obsidian">{details.stats.totalVisits}</p>
            </Card>
            <Card className="p-6 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2">
              <p className="font-outfit text-sm text-slate-500">Lifetime Value</p>
              <p className="text-3xl font-playfair font-bold text-obsidian">${details.stats.lifetimeValue.toFixed(2)}</p>
            </Card>
            <Card className="p-6 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2">
              <p className="font-outfit text-sm text-slate-500">Points Balance</p>
              <p className="text-3xl font-playfair font-bold text-obsidian">{details.profile?.loyaltyPoints || 0}</p>
            </Card>
            <Card className="p-6 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2">
              <p className="font-outfit text-sm text-slate-500">Last Visit</p>
              <p className="text-xl font-playfair font-bold text-obsidian">
                {details.stats.lastVisit ? format(new Date(details.stats.lastVisit), "MMM d, yyyy") : "N/A"}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-playfair font-semibold text-obsidian">Next Appointment</h3>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-outfit text-sm">
                  View Schedule <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <Card className="p-8 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                {details.history.some(a => new Date(a.startTime) > new Date()) ? (
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600">
                      <span className="text-xs font-outfit font-bold uppercase">Oct</span>
                      <span className="text-2xl font-playfair font-bold">24</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-outfit font-semibold text-lg text-obsidian">Routine Checkup & Cleaning</p>
                      <p className="font-outfit text-slate-500">Downtown Branch • 10:00 AM - 11:00 AM</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="font-outfit text-slate-500 italic">No upcoming appointments scheduled.</p>
                    <Button variant="outline" className="rounded-xl border-slate-100 font-outfit">
                      Schedule One Now
                    </Button>
                  </div>
                )}
              </Card>

              <div className="flex items-center justify-between pt-4">
                <h3 className="text-xl font-playfair font-semibold text-obsidian">Recent Clinical Notes</h3>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-outfit text-sm">
                  All Records <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {details.notes.slice(0, 2).map((note) => (
                  <Card key={note.id} className="p-6 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="font-outfit font-medium text-slate-700">Clinical Entry</p>
                      </div>
                      <p className="font-outfit text-xs text-slate-400">{format(new Date(note.createdAt), "PPP")}</p>
                    </div>
                    <p className="font-outfit text-slate-600 line-clamp-3 italic leading-relaxed">
                      "{note.content}"
                    </p>
                  </Card>
                ))}
                {details.notes.length === 0 && (
                  <p className="text-center py-8 text-slate-400 font-outfit italic">No clinical notes recorded yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-playfair font-semibold text-obsidian">Loyalty Status</h3>
              <Card className="p-8 rounded-3xl border-transparent bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_20px_40px_rgba(0,71,255,0.2)] text-white space-y-6">
                <div className="flex items-center justify-between">
                  <Award className="w-8 h-8 opacity-80" />
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-transparent backdrop-blur-md">
                    Platinum Tier
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-playfair font-bold">{details.profile?.loyaltyPoints || 0}</p>
                  <p className="font-outfit text-blue-100 text-sm opacity-80 uppercase tracking-widest">Available Points</p>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold font-outfit">
                    Redeem Points
                  </Button>
                </div>
              </Card>

              {details.loyalty.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-playfair font-semibold text-obsidian">Recent Activity</h3>
                  <div className="space-y-3">
                    {details.loyalty.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-mint-50 text-mint-600' : 'bg-rose-50 text-rose-600'}`}>
                            {tx.amount > 0 ? <Plus className="w-4 h-4" /> : <Plus className="w-4 h-4 rotate-45" />}
                          </div>
                          <div>
                            <p className="font-outfit text-sm font-medium text-slate-700">{tx.reason}</p>
                            <p className="font-outfit text-[10px] text-slate-400 uppercase tracking-tighter">{format(new Date(tx.createdAt), "MMM d")}</p>
                          </div>
                        </div>
                        <p className={`font-outfit font-bold ${tx.amount > 0 ? 'text-mint-600' : 'text-rose-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-4">
                <h3 className="text-xl font-playfair font-semibold text-obsidian">Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="font-outfit text-slate-700">Email Marketing</span>
                    </div>
                    <Badge className="bg-mint-50 text-mint-700 border-transparent">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="font-outfit text-slate-700">SMS Reminders</span>
                    </div>
                    <Badge className="bg-mint-50 text-mint-700 border-transparent">Enabled</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in slide-in-from-bottom-2 duration-400">
          <div className="max-w-4xl mx-auto space-y-12 py-8">
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-12">
              {details.history.map((apt) => (
                <div key={apt.id} className="relative pl-10 group">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition-transform" />
                  <div className="space-y-4">
                    <p className="font-outfit text-sm text-slate-400 font-medium uppercase tracking-wider">
                      {format(new Date(apt.startTime), "MMMM d, yyyy")}
                    </p>
                    <Card className="p-8 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <h4 className="text-2xl font-playfair font-semibold text-obsidian">{apt.serviceName}</h4>
                          <p className="font-outfit text-slate-500">{apt.branchName} • {format(new Date(apt.startTime), "p")}</p>
                        </div>
                        <Badge variant="outline" className={`font-outfit capitalize px-4 py-1.5 rounded-full border-transparent ${
                          apt.status === 'completed' ? 'bg-mint-50 text-mint-700' :
                          apt.status === 'cancelled' ? 'bg-rose-50 text-rose-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {apt.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {apt.actualPrice && (
                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                          <p className="font-outfit text-slate-400 text-sm">Fee Paid</p>
                          <p className="font-outfit font-bold text-obsidian text-lg">${apt.actualPrice}</p>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              ))}
              {details.history.length === 0 && (
                <p className="text-center py-12 text-slate-400 font-outfit italic">No appointment history found.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="records" className="animate-in slide-in-from-bottom-2 duration-400">
          <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-playfair font-semibold text-obsidian">Clinical Records</h3>
              <Button className="rounded-xl bg-blue-600 font-outfit">
                <Plus className="w-4 h-4 mr-2" /> New Entry
              </Button>
            </div>
            <div className="space-y-6">
              {details.notes.map((note) => (
                <Card key={note.id} className="p-8 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Star className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-outfit font-semibold text-obsidian">Dr. Sarah Jenkins</p>
                        <p className="font-outfit text-xs text-slate-400">Chief Dentist</p>
                      </div>
                    </div>
                    <p className="font-outfit text-sm text-slate-400">{format(new Date(note.createdAt), "PPP")}</p>
                  </div>
                  <p className="font-outfit text-slate-600 leading-relaxed italic text-lg">
                    "{note.content}"
                  </p>
                </Card>
              ))}
              {details.notes.length === 0 && (
                <p className="text-center py-12 text-slate-400 font-outfit italic">No clinical records found.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="communications" className="animate-in slide-in-from-bottom-2 duration-400">
          <div className="max-w-4xl mx-auto space-y-8 py-8">
             <div className="flex items-center justify-between">
              <h3 className="text-2xl font-playfair font-semibold text-obsidian">Communication Log</h3>
            </div>
            <div className="space-y-4">
              {details.communications.map((log) => (
                <Card key={log.id} className="p-6 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      {log.type === 'email' ? <Mail className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-outfit font-semibold text-obsidian">{log.subject || log.templateName}</p>
                      <p className="font-outfit text-sm text-slate-500">{log.recipient}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="font-outfit border-transparent bg-mint-50 text-mint-700">
                      {log.status}
                    </Badge>
                    <p className="font-outfit text-xs text-slate-400">{format(new Date(log.createdAt), "MMM d, h:mm a")}</p>
                  </div>
                </Card>
              ))}
              {details.communications.length === 0 && (
                <p className="text-center py-12 text-slate-400 font-outfit italic">No communication history found.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="animate-in slide-in-from-bottom-2 duration-400">
          <div className="max-w-2xl mx-auto space-y-8 py-8">
            <h3 className="text-2xl font-playfair font-semibold text-obsidian">Patient Settings</h3>
            <div className="space-y-6">
              <Card className="p-8 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                <div className="space-y-2">
                  <h4 className="font-outfit font-semibold text-obsidian">Loyalty Point Adjustment</h4>
                  <p className="font-outfit text-sm text-slate-500">Manually add or remove points from this patient's balance.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input placeholder="Enter amount (e.g. 500)" className="h-11 rounded-lg font-outfit" type="number" />
                  <Button className="h-11 px-6 rounded-lg bg-blue-600 font-outfit">Update Balance</Button>
                </div>
              </Card>

              <Card className="p-8 rounded-2xl border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 text-rose-600">
                <div className="space-y-2">
                  <h4 className="font-outfit font-semibold">Danger Zone</h4>
                  <p className="font-outfit text-sm text-slate-500">Archiving a patient will hide them from the active directory but preserve their history.</p>
                </div>
                <Button variant="outline" className="h-11 border-rose-100 text-rose-600 hover:bg-rose-50 font-outfit">
                  Archive Patient Record
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
