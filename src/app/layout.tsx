import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import FloatingChatbot from "@/components/chat/FloatingChatbot";

import BottomHelpDeskLink from "@/components/navigation/BottomHelpDeskLink";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PredictiX",
  description:
    "AI-Powered Predictive Maintenance & Smart Ticket Categorization for Asset Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}

          <BottomHelpDeskLink />

          <FloatingChatbot />
          <Toaster closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
