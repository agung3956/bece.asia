import { CreativeBusinessToolsClient } from "@/components/creative-business-tools-client";
import { PageShell } from "@/components/page-shell";

export default function DigitalGuestbookPage() {
  return <PageShell locale="id" currentPath="/apps/digital-guestbook"><CreativeBusinessToolsClient kind="guestbook" /></PageShell>;
}
