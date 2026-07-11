import { AttendanceWorkspaceClient } from "@/components/attendance-workspace-client";
import { PageShell } from "@/components/page-shell";

export default function AttendanceWorkspacePage() {
  return (
    <PageShell locale="id" currentPath="/apps/attendance-workspace">
      <AttendanceWorkspaceClient />
    </PageShell>
  );
}
