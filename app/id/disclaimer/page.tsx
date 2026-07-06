import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function IndonesianDisclaimerPage() {
  return (
    <PageShell locale="id" currentPath="/id/disclaimer">
      <BasicPage
        title="Disclaimer"
        description="bece.asia adalah portal utilitas independen. Situs ini bukan website resmi pemerintah dan tidak memberi keputusan hukum, tarif, kepabeanan, pengadaan, atau administrasi yang mengikat."
        items={[
          "Semua keluaran aplikasi bersifat informatif dan harus divalidasi ke dokumen sumber resmi.",
          "Branding, teks, dan data aplikasi disanitasi untuk penggunaan publik dan tidak menyiratkan dukungan instansi.",
          "Alur kerja sensitif sengaja disederhanakan sebelum dipublikasikan.",
          "Jika ada alat yang terlihat memuat informasi privat atau nonpublik, hentikan penggunaan dan laporkan melalui halaman masukan."
        ]}
      />
    </PageShell>
  );
}
