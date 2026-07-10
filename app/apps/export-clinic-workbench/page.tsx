import { ExportClinicWorkbenchClient } from "@/components/export-clinic-workbench-client";
import { PageShell } from "@/components/page-shell";

export default function ExportClinicWorkbenchPage() {
  return (
    <PageShell locale="id" currentPath="/apps/export-clinic-workbench">
      <ExportClinicWorkbenchClient />
    </PageShell>
  );
}
