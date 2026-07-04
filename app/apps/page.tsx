import { AppsPageContent } from "@/components/apps-page-content";
import { PageShell } from "@/components/page-shell";

export default function AppsPage() {
  return (
    <PageShell locale="en" currentPath="/apps">
      <AppsPageContent locale="en" />
    </PageShell>
  );
}
