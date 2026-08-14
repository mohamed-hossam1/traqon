"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { listUsers } from "@/actions/admin";
import { adminUsersQueryKey } from "@/lib/reactQuery/query-keys";
import { SearchInput } from "./SearchInput";
import { FilterDropdown } from "./FilterDropdown";
import { StatusBadge } from "./StatusBadge";
import { RoleBadge } from "./RoleBadge";
import { TableSkeleton } from "./TableSkeleton";
import { TablePagination } from "./TablePagination";
import { UserActions } from "./UserActions";
import { ROUTES } from "@/constants/routes";
import type { AdminPublicUser } from "@/types/admin";
import { unwrapAction } from "@/lib/next-action-handler/unwrap";

export function UsersTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getParam = (key: string, fallback: number) => {
    const val = searchParams?.get(key);
    if (!val) return fallback;
    const n = parseInt(val, 10);
    return Number.isNaN(n) ? fallback : n;
  };

  const page = getParam("page", 1);
  const limit = getParam("limit", 10);
  const search = searchParams?.get("search") ?? "";
  const status =
    searchParams?.get("status") === "banned"
      ? "banned"
      : searchParams?.get("status") === "active"
        ? "active"
        : undefined;
  const role =
    searchParams?.get("role") === "admin"
      ? "admin"
      : searchParams?.get("role") === "user"
        ? "user"
        : undefined;
  const rawSortBy = searchParams?.get("sortBy");
  const sortBy: "createdAt" | "name" | "email" =
    rawSortBy === "name" || rawSortBy === "email" || rawSortBy === "createdAt"
      ? rawSortBy
      : "createdAt";
  const sortOrder: "asc" | "desc" =
    searchParams?.get("sortOrder") === "asc" ? "asc" : "desc";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...adminUsersQueryKey, page, limit, search, status, role, sortBy, sortOrder],
    queryFn: () =>
      unwrapAction(
        listUsers({ page, limit, search, status, role, sortBy, sortOrder })
      ),
  });

  const setParam = useCallback(
    (key: string, value?: string | number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      const currentValue = params.get(key) ?? "";
      const newValue = value !== undefined && value !== "" ? String(value) : "";
      if (currentValue === newValue && key !== "page") return;

      params.set("page", "1");
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      router.replace(`${ROUTES.ADMIN_USERS}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const handleSort = useCallback(
    (column: "createdAt" | "name" | "email") => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("page", "1");
      if (sortBy === column) {
        params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
      } else {
        params.set("sortBy", column);
        params.set("sortOrder", "desc");
      }
      router.replace(`${ROUTES.ADMIN_USERS}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, sortBy, sortOrder],
  );

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setParam("search", v || undefined)}
          placeholder="Search users..."
        />
        <FilterDropdown
          label="Status"
          options={[
            { value: "active", label: "Active" },
            { value: "banned", label: "Banned" },
          ]}
          value={status}
          onChange={(v) => setParam("status", v)}
        />
        <FilterDropdown
          label="Role"
          options={[
            { value: "user", label: "User" },
            { value: "admin", label: "Admin" },
          ]}
          value={role}
          onChange={(v) => setParam("role", v)}
        />
      </div>

      {isLoading && <TableSkeleton rows={5} columns={5} />}

      {error && (
        <div className="border border-destructive bg-destructive/5 rounded-none p-6">
          <p className="font-serif-body italic text-destructive text-sm">
            {error instanceof Error ? error.message : "Failed to load users"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 font-mono text-[11px] uppercase tracking-widest text-accent underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <div className="border border-border bg-card rounded-none p-8">
          <p className="font-serif-body italic text-muted-foreground text-center">
            No users found
          </p>
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <>
          <div className="border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card">
                  {[
                    { key: "name", label: "Name", sortable: true },
                    { key: "role", label: "Role", sortable: false },
                    { key: "status", label: "Status", sortable: false },
                    { key: "createdAt", label: "Created At", sortable: true },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={
                        col.sortable
                          ? () => handleSort(col.key as "createdAt" | "name" | "email")
                          : undefined
                      }
                      className={`px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium ${
                        col.sortable ? "cursor-pointer select-none" : ""
                      }`}
                    >
                      {col.label}
                      {col.sortable && (
                        <span className={`ml-1 ${sortBy === col.key ? "text-accent" : "text-muted-foreground/50"}`}>
                          {sortBy === col.key
                            ? (sortOrder === "asc" ? "↑" : "↓")
                            : "↑↓"}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: AdminPublicUser) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-card/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {user.name ?? "Unnamed"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.isBanned ? "banned" : "active"} />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <UserActions user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setParam("page", p)}
            />
          )}
        </>
      )}
    </div>
  );
}
