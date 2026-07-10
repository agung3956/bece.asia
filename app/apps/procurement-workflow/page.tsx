import { PageShell } from "@/components/page-shell";
import { ProcurementWorkflowClient } from "@/components/procurement-workflow-client";

export default function ProcurementWorkflowPage() {
  return (
    <PageShell locale="id" currentPath="/apps/procurement-workflow">
      <ProcurementWorkflowClient />
    </PageShell>
  );
}
