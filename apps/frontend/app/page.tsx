import type { Metadata } from "next";

import { ModeToggle } from "@/components/ui/mode-toggle";

export const metadata: Metadata = {
  title: "Home",
  description: "A modern web application built with Next.js",
};

export default function Home() {
  return (
    <div>
      <ModeToggle />
    </div>
  );
}
