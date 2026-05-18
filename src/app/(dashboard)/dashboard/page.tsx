"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, FolderOpen, User } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { projectService } from "@/services/project.service";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: projects = [], refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await projectService.list();
      return data;
    },
  });

  const createProject = async () => {
    const { data } = await projectService.create({ name: `Project ${Date.now()}` });
    refetch();
    window.location.href = `/editor/${data.id}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 px-8 py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/account">
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" /> Account & Plans
                </Button>
              </Link>
              <Button onClick={createProject} className="gap-2">
                <Plus className="h-4 w-4" /> New Project
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/editor/${project.id}`}
                className="group rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-primary/40 hover:shadow-node"
              >
                <FolderOpen className="mb-3 h-8 w-8 text-primary" />
                <h3 className="font-semibold group-hover:text-primary">{project.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <p>No projects yet. Create your first workflow.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
