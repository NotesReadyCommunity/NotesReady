import React from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="space-y-6 max-w-sm">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>

        <div className="p-4 mx-auto w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)]">
          <FileQuestion size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Note or Page Not Found
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The note or page you were looking for does not exist, was moved, or you may need permission to access it.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/app">
            <Button variant="primary" size="md" className="w-full text-xs">
              <ArrowLeft size={14} />
              <span>Return to Workspace</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
