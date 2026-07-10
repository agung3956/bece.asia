import { CreativeBusinessToolsClient } from "@/components/creative-business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function PageForgePage() {
  return <PageShell locale="id" currentPath="/apps/pageforge"><CreativeBusinessToolsClient kind="pageforge" /></PageShell>;
}
