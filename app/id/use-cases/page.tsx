import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function IndonesianUseCasesPage() {
  return (
    <PageShell locale="id" currentPath="/id/use-cases">
      <BasicPage
        title="Skenario Penggunaan"
        description="Skenario praktis penggunaan tools bece.asia dalam pekerjaan harian."
        items={["Tata naskah", "Monitoring program", "Dukungan ekspor", "Workspace kajian", "Media pembelajaran", "Utilities kantor"]}
      />
    </PageShell>
  );
}
