import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTenantId } from "@/lib/db/tenant";
import { BranchManager } from "@/components/dashboard/BranchManager";
import { ServicesTab } from "@/components/dashboard/settings/ServicesTab";
import { StaffTab } from "@/components/dashboard/settings/StaffTab";
import { StaffRoster } from "@/components/dashboard/StaffRoster";

export default async function SettingsPage() {
  const tenantId = await getTenantId();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-playfair font-semibold text-obsidian">Clinic Operations</h1>
        <p className="text-slate-500 font-outfit text-lg">Manage your branches, services, and staff</p>
      </div>

      <Tabs defaultValue="branches" className="space-y-6">
        <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start h-auto p-0 gap-8 rounded-none">
          <TabsTrigger 
            value="branches" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-4 pt-0 font-outfit text-base text-slate-500 data-[state=active]:text-obsidian transition-all"
          >
            Branches
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-4 pt-0 font-outfit text-base text-slate-500 data-[state=active]:text-obsidian transition-all"
          >
            Services
          </TabsTrigger>
          <TabsTrigger 
            value="staff" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-4 pt-0 font-outfit text-base text-slate-500 data-[state=active]:text-obsidian transition-all"
          >
            Staff
          </TabsTrigger>
          <TabsTrigger 
            value="roster" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-4 pt-0 font-outfit text-base text-slate-500 data-[state=active]:text-obsidian transition-all"
          >
            Roster
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="branches" className="mt-6 border-none p-0 outline-none">
          <BranchManager tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="services" className="mt-6 border-none p-0 outline-none">
          <ServicesTab tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="staff" className="mt-6 border-none p-0 outline-none">
          <StaffTab tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="roster" className="mt-6 border-none p-0 outline-none">
          <StaffRoster tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
