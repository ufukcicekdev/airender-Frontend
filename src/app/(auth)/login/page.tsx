"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import { redirectToEditor } from "@/lib/redirect-to-editor";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { APP_DEMO_EMAIL, APP_NAME } from "@/lib/brand";

/** Legacy demo account (older seeds); login accepts both. */
const DEMO_EMAIL_LEGACY = "demo@vizmake.local";
const DEMO_PASSWORD = "demo1234";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();
  const [email, setEmail] = useState(APP_DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      await redirectToEditor(router);
    } catch (err) {
      const msg = getAuthErrorMessage(err);
      setError(msg);
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(APP_DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <Link
        href="/"
        className="absolute left-4 top-4 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/50 p-8 shadow-glass backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--viz-cyan))] text-lg font-bold text-[hsl(220,25%,6%)]">
            F
          </div>
          <h1 className="text-2xl font-bold">Welcome back to {APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">Sign in to open the node editor</p>
        </div>

        <div className="mb-4 rounded-lg border border-[hsl(var(--viz-cyan)/0.25)] bg-[hsl(var(--viz-cyan)/0.08)] p-3 text-xs">
          <p className="font-medium text-[hsl(var(--viz-cyan))]">Demo account</p>
          <p className="mt-1 text-muted-foreground">
            Email: <code className="text-foreground">{APP_DEMO_EMAIL}</code>
            <span className="text-muted-foreground/80"> (or {DEMO_EMAIL_LEGACY})</span>
          </p>
          <p className="text-muted-foreground">
            Password: <code className="text-foreground">{DEMO_PASSWORD}</code>
          </p>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-2 text-[hsl(var(--viz-cyan))] hover:underline"
          >
            Fill demo credentials
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full bg-[hsl(var(--viz-cyan))] text-[hsl(220,25%,6%)] hover:opacity-90" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="text-[hsl(var(--viz-cyan))] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
