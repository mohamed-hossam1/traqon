import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <Card className="w-full max-w-md border border-foreground border-t-4 border-t-accent bg-card rounded-none shadow-none p-6 md:p-8">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
