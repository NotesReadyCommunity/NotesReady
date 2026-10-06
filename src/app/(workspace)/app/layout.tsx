"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <AppSidebar className="hidden md:flex shrink-0" />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title="Getting Started with NotesReady"
        />
        <main className="flex-1 overflow-y-auto bg-[var(--surface-0)] p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
