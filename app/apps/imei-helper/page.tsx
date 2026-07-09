import { ImeiHelperClient } from "@/components/imei-helper-client";
import { PageShell } from "@/components/page-shell";

export default function ImeiHelperPage() {
  return (
    <PageShell locale="id" currentPath="/apps/imei-helper">
      <ImeiHelperClient />
    </PageShell>
  );
}
