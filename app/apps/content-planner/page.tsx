import { CreativeBusinessToolsClient } from "@/components/creative-business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function ContentPlannerPage() {
  return <PageShell locale="id" currentPath="/apps/content-planner"><CreativeBusinessToolsClient kind="content-planner" /></PageShell>;
}
