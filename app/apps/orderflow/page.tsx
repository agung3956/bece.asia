import { CreativeBusinessToolsClient } from "@/components/creative-business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function OrderFlowPage() {
  return <PageShell locale="id" currentPath="/apps/orderflow"><CreativeBusinessToolsClient kind="orderflow" /></PageShell>;
}
