import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";

import { QueryProvider } from "@/components/providers/query-provider";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/config/auth";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { LanguageSwitcher } from "@/components/language-switcher";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zozo booking - Restaurant Ordering System",
  description: "Order food from your table with QR code",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for NextIntlClientProvider
  const messages = await getMessages();

  // Get the session server-side to avoid client-side errors
  const session = (await auth()) ?? null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider session={session}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NextIntlClientProvider messages={messages}>
                {children}
                <div className="fixed top-4 right-4 z-40 flex gap-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                <Toaster />
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
