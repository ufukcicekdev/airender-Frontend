"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AccountPanel } from "@/components/account/account-panel";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col bg-[hsl(220,20%,6%)]">
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <AccountPanel className="flex-1" />
      </div>
    </ProtectedRoute>
  );
}
