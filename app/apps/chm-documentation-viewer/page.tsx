import { ChmDocumentationViewerClient } from "@/components/chm-documentation-viewer-client";
import { PageShell } from "@/components/page-shell";

export default function ChmDocumentationViewerPage() {
  return (
    <PageShell locale="id" currentPath="/apps/chm-documentation-viewer">
      <ChmDocumentationViewerClient />
    </PageShell>
  );
}
