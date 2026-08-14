"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProfileDialogTab } from "@/lib/profile-dialog";
import { Monitor, ShieldCheck, User, Link } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const tabs: Array<{
  value: ProfileDialogTab;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "profile", label: "Profile", icon: User },
  { value: "security", label: "Security", icon: ShieldCheck },
  { value: "sessions", label: "Sessions", icon: Monitor },
  { value: "links", label: "Links", icon: Link },
];

export function ProfileTabsList() {
  return (
    <TabsList
      aria-label="Account settings sections"
      className="mt-2 flex h-auto w-full flex-col items-stretch gap-0.5 rounded-none bg-transparent p-0"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="group relative inline-flex h-auto w-full items-center justify-start gap-2.5 rounded-none border-l-2 border-transparent bg-transparent px-3 py-2 font-serif-body text-[15px] text-foreground transition-colors cursor-pointer hover:bg-foreground/5 hover:text-foreground data-active:border-l-accent data-active:bg-accent/10 data-active:text-accent data-active:shadow-none focus-visible:border-l-accent focus-visible:bg-accent/5 focus-visible:outline-none focus-visible:ring-0"
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{tab.label}</span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
