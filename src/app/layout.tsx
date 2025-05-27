import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { ClientSessionProvider } from "@/components/ClientSessionProvider";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Chat Application",
  description: "A ChatGPT-style web application",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Toaster />
            <LoadingScreen>
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </LoadingScreen>
          </ThemeProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
