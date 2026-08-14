import { Suspense } from "react";
import { UsersTable } from "@/components/admin/UsersTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif-display italic text-2xl">Users</h1>
      <Suspense fallback={<TableSkeleton rows={5} columns={5} />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
