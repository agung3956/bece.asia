import { PageShell } from "@/components/page-shell";
import { ResearchWorkbenchClient } from "@/components/research-workbench-client";

export default function ResearchWorkbenchPage() {
  return (
    <PageShell locale="id" currentPath="/apps/research-workbench">
      <ResearchWorkbenchClient />
    </PageShell>
  );
}
