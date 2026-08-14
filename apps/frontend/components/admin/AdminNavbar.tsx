"use client";

import { useSession } from "@/hooks/session";
import { signOut } from "@/actions/auth";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function AdminNavbar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user;

  return (
    <header className="flex h-16 items-center justify-between border-b border-foreground bg-card rounded-none px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden text-foreground hover:text-accent cursor-pointer"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="font-serif-display italic text-lg text-foreground">
          Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">
              {user?.name ?? user?.email ?? "Admin"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {user?.role ?? "admin"}
            </span>
          </div>
          <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium text-sm">
            {(user?.name ?? user?.email ?? "A")[0].toUpperCase()}
          </div>
        </div>
        <Button
          variant="auth-outline"
          size="auth-sm"
          onClick={async () => {
            await signOut();
            router.replace(ROUTES.LOGIN);
          }}
        >
          <LogOut className="size-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
}
