import { EwsDashboardClient } from "@/components/ews-dashboard-client";
import { PageShell } from "@/components/page-shell";

export default function EwsDashboardPage() {
  return (
    <PageShell locale="id" currentPath="/apps/ews-dashboard">
      <EwsDashboardClient />
    </PageShell>
  );
}
