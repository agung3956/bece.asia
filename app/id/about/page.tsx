import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function IndonesianAboutPage() {
  return (
    <PageShell locale="id" currentPath="/id/about">
      <BasicPage
        title="Tentang bece.asia"
        description="bece.asia adalah portal untuk tools digital praktis, aplikasi ringan, dan eksperimen produktivitas."
        items={["Default English", "Opsi Bahasa Indonesia", "Branding netral", "Deploy Vercel", "Katalog aplikasi mudah diedit", "Status community-built"]}
      />
    </PageShell>
  );
}
