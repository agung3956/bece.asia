import { BusinessToolsClient } from "@/components/business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function TaskWorkspacePage() {
  return <PageShell locale="id" currentPath="/apps/task-workspace"><BusinessToolsClient kind="tasks" /></PageShell>;
}
