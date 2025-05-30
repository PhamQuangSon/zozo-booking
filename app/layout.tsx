import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";

import { QueryProvider } from "@/components/providers/query-provider";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/config/auth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zozo booking - Restaurant Ordering System",
  description: "Order food from your table with QR code",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the session server-side to avoid client-side errors
  const session = (await auth()) ?? null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider session={session}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
