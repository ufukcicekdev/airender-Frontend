"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProjectCard } from "@/components/dashboard/project-card";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { projectService } from "@/services/project.service";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    enabled: isAuthenticated && !authLoading,
    queryFn: async () => {
      const { data } = await projectService.list();
      return data;
    },
  });

  const createProject = async () => {
    const { data } = await projectService.create({});
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    window.location.href = `/editor/${data.id}`;
  };

  const handleRename = async (id: string, name: string) => {
    await projectService.update(id, { name });
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const handleDelete = async (id: string) => {
    await projectService.delete(id);
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="Projects"
        subtitle={user ? `Welcome back, ${user.username}` : undefined}
        actions={
          <Button onClick={createProject} className="gap-2">
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading projects…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 px-8 py-16 text-center">
            <p className="text-lg font-medium">No projects yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a workflow and start generating on the canvas.
            </p>
            <Button onClick={createProject} className="mt-6 gap-2">
              <Plus className="h-4 w-4" /> Create your first project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
