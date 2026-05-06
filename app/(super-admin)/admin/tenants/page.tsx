import { getAllTenants } from "@/lib/admin/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function TenantsPage() {
  const tenants = await getAllTenants();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenants Overview</h1>
        <p className="text-muted-foreground">Monitor all clinic tenants on the platform.</p>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Total Appts</TableHead>
              <TableHead>Appts Today</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell className="font-mono text-xs">{tenant.tenantId}</TableCell>
                <TableCell>{tenant.branchCount}</TableCell>
                <TableCell>{tenant.appointmentCount}</TableCell>
                <TableCell>{tenant.appointmentsToday}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
