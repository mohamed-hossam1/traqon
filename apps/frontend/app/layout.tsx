import type { Metadata } from "next";
import {
  DM_Serif_Display,
  DM_Serif_Text,
  IBM_Plex_Mono,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import QueryProvider from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { BannedGuard } from "@/components/auth/BannedGuard";
import { RevocationListener } from "@/components/auth/RevocationListener";

import "./globals.css";

const serifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif-display",
});

const serifText = DM_Serif_Text({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif-body",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    template: "%s | Dashboard",
    default: "Dashboard",
  },
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serifDisplay.variable} ${serifText.variable} ${mono.variable}`}
    >
      <body>
        <QueryProvider>
          <RevocationListener />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BannedGuard>{children}</BannedGuard>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
