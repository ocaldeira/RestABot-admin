"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { PageTitleProvider } from "@/components/PageTitleContext";
import { AuthProvider } from "@/components/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AuthProvider>
        <SidebarProvider>
          <PageTitleProvider>{children}</PageTitleProvider>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
