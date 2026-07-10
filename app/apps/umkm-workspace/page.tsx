import { PageShell } from "@/components/page-shell";
import { UmkmWorkspaceClient } from "@/components/umkm-workspace-client";

export default function UmkmWorkspacePage() {
  return (
    <PageShell locale="id" currentPath="/apps/umkm-workspace">
      <UmkmWorkspaceClient />
    </PageShell>
  );
}
