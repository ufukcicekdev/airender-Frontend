import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { projectService } from "@/services/project.service";

/** After login: open latest project or create a new one (VizMaker-style editor). */
export async function redirectToEditor(router: AppRouterInstance) {
  try {
    const { data: projects } = await projectService.list();
    if (projects.length > 0) {
      router.push(`/editor/${projects[0].id}`);
      return;
    }
    const { data: project } = await projectService.create({ name: "Untitled" });
    router.push(`/editor/${project.id}`);
  } catch {
    // Fallback if projects API fails — still land in editor
    const { data: project } = await projectService.create({ name: "Untitled" });
    router.push(`/editor/${project.id}`);
  }
}
