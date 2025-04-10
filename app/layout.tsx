import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider"
import { SessionDebug } from "@/components/session-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zozo booking - Restaurant Ordering System",
  description: "Order food from your table with QR code",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>          
          <AuthProvider>
            {children}
            {process.env.NODE_ENV === "development" && <SessionDebug />}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
