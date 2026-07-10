import { BusinessToolsClient } from "@/components/business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function MiniPosPage() {
  return <PageShell locale="id" currentPath="/apps/mini-pos"><BusinessToolsClient kind="pos" /></PageShell>;
}
