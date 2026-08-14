import { Suspense } from "react";
import { AuditLogsTable } from "@/components/admin/AuditLogsTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export const metadata = {
  title: "Audit Logs | Admin",
  description: "View and inspect all admin action audit logs",
};

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-foreground/10 pb-4">
        <h1 className="font-serif-display italic text-2xl">Admin Audit Logs</h1>
        <p className="text-xs font-mono text-muted-foreground">
          Track and inspect security-sensitive administrative actions (bans, unbans, role changes, session revocations).
        </p>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
        <AuditLogsTable />
      </Suspense>
    </div>
  );
}
