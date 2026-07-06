import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function IndonesianDataPolicyPage() {
  return (
    <PageShell locale="id" currentPath="/id/data-policy">
      <BasicPage
        title="Kebijakan Data"
        description="Aplikasi yang dipublikasikan harus dibersihkan sebelum dicantumkan atau ditempel di bece.asia."
        items={[
          "Hapus nama, identitas, nomor dokumen internal, endpoint privat, dan catatan nonpublik.",
          "Gunakan data contoh, referensi publik, atau struktur yang dianonimkan untuk demonstrasi.",
          "Jangan mempublikasikan data penindakan, intelijen, risiko, koordinat, atau dataset operasional terbatas.",
          "Setiap aplikasi sensitif perlu memuat pemberitahuan penggunaan publik dan pengingat validasi ke referensi resmi."
        ]}
      />
    </PageShell>
  );
}
