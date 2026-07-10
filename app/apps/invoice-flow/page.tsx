import { BusinessToolsClient } from "@/components/business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function InvoiceFlowPage() {
  return <PageShell locale="id" currentPath="/apps/invoice-flow"><BusinessToolsClient kind="invoice" /></PageShell>;
}
