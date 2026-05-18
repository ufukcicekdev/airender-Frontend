"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import { redirectToEditor } from "@/lib/redirect-to-editor";

export default function SignupPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const { toast } = useToast();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [freeCredits, setFreeCredits] = useState<number | null>(null);

  useEffect(() => {
    authService
      .getSignupConfig()
      .then(({ data }) => setFreeCredits(data.free_signup_credits))
      .catch(() => setFreeCredits(5));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      await redirectToEditor(router);
    } catch {
      toast({ title: "Registration failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
        <h1 className="mb-2 text-2xl font-bold text-center">Create account</h1>
        {freeCredits !== null ? (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Start with{" "}
            <span className="font-medium text-[hsl(var(--viz-cyan))]">
              {freeCredits} free credits
            </span>
          </p>
        ) : (
          <div className="mb-6" />
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input type="password" value={form.password_confirm} onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} required className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
