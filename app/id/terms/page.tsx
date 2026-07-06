import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function IndonesianTermsPage() {
  return (
    <PageShell locale="id" currentPath="/id/terms">
      <BasicPage
        title="Ketentuan"
        description="Dengan menggunakan bece.asia, pengguna memahami bahwa setiap aplikasi adalah utilitas komunitas independen untuk pembelajaran, produktivitas, dan alur kerja aman-publik."
        items={[
          "Gunakan alat sebagai referensi, prototipe, atau bantuan produktivitas.",
          "Jangan mengunggah atau memasukkan catatan terbatas, identitas pribadi, kata sandi, token akses, atau informasi operasional rahasia.",
          "Pengguna bertanggung jawab memeriksa hukum, regulasi, tarif, dan prosedur melalui kanal resmi.",
          "Alat dapat berubah, diarsipkan, atau diganti ketika aplikasi disanitasi dan dipindahkan ke bece.asia."
        ]}
      />
    </PageShell>
  );
}
