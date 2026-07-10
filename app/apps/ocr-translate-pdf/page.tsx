import { OcrTranslatePdfClient } from "@/components/ocr-translate-pdf-client";
import { PageShell } from "@/components/page-shell";

export default function OcrTranslatePdfPage() {
  return (
    <PageShell locale="id" currentPath="/apps/ocr-translate-pdf">
      <OcrTranslatePdfClient />
    </PageShell>
  );
}
