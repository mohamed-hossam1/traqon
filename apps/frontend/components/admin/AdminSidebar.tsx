"use client";

import { ShieldAlert, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

const navItems = [
  { label: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
  { label: "Audit Logs", href: ROUTES.ADMIN_AUDIT_LOGS, icon: ShieldAlert },
];

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const navContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-foreground px-6">
        <Link href={ROUTES.ADMIN} className="font-serif-display italic text-xl">
          Admin Console
        </Link>
        <button
          type="button"
          className="md:hidden text-foreground hover:text-accent cursor-pointer"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-widest transition-colors
                    ${
                      isActive
                        ? "border-l-2 border-accent bg-accent/5 text-foreground"
                        : "text-muted-foreground hover:bg-foreground/5"
                    }
                  `}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-foreground bg-card transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
      <aside className="hidden md:flex w-[260px] flex-col border-r border-foreground bg-card rounded-none">
        {navContent}
      </aside>
    </>
  );
}
