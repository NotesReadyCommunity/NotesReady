"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentNoteTitle, saveStatus, isStorageDurable, storageError } = useWorkspace();

  // Determine contextual header title and save status relevance (P1 Fix #5)
  const isEditingNote = pathname.startsWith("/app/notes/") && pathname !== "/app/notes";

  let headerTitle = "Workspace";
  if (isEditingNote) {
    headerTitle = currentNoteTitle || "Untitled note";
  } else if (pathname === "/app/notes") {
    headerTitle = "All Notes";
  } else if (pathname === "/app/favorites") {
    headerTitle = "Favorites";
  } else if (pathname === "/app/shared") {
    headerTitle = "Shared";
  }

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
          title={headerTitle}
          saveStatus={saveStatus}
          showSaveStatus={isEditingNote}
          isStorageDurable={isStorageDurable}
          storageError={storageError}
        />
        <main className="flex-1 overflow-y-auto bg-[var(--surface-0)] p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
