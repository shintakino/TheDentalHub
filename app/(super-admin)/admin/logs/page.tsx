import { getGlobalAuditLogs } from "@/lib/admin/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default async function AuditLogsPage() {
  const logs = await getGlobalAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global Audit Logs</h1>
        <p className="text-muted-foreground">Real-time stream of all system activity.</p>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs">
                  {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell className="font-mono text-xs">{log.tenantId}</TableCell>
                <TableCell>
                  <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                    {log.action}
                  </code>
                </TableCell>
                <TableCell className="text-xs">{log.userId}</TableCell>
                <TableCell className="text-xs max-w-xs truncate">
                  {JSON.stringify(log.payload)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
