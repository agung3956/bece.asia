import { LearningMonitoringClient } from "@/components/learning-monitoring-client";
import { PageShell } from "@/components/page-shell";

export default function LearningMonitoringPage() {
  return (
    <PageShell locale="id" currentPath="/apps/learning-monitoring">
      <LearningMonitoringClient />
    </PageShell>
  );
}
