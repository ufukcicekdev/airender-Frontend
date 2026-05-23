"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AccountPanel } from "@/components/account/account-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="overflow-hidden rounded-xl border border-border/50 bg-[hsl(220,18%,9%)]">
          <AccountPanel className="max-h-none min-h-[60vh] border-0" />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
