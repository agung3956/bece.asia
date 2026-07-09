import { PageShell } from "@/components/page-shell";
import { PerjadinClient } from "@/components/perjadin-client";

export default function TravelDutyPlannerPage() {
  return (
    <PageShell locale="id" currentPath="/apps/travel-duty-planner">
      <PerjadinClient />
    </PageShell>
  );
}
