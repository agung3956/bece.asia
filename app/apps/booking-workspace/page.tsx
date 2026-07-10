import { BusinessToolsClient } from "@/components/business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function BookingWorkspacePage() {
  return <PageShell locale="id" currentPath="/apps/booking-workspace"><BusinessToolsClient kind="booking" /></PageShell>;
}
