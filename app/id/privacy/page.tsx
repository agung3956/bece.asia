import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function IndonesianPrivacyPage() {
  return (
    <PageShell locale="id" currentPath="/id/privacy">
      <BasicPage
        title="Privasi"
        description="bece.asia dirancang untuk utilitas yang aman digunakan publik. Jangan memasukkan data rahasia, pribadi, resmi, atau operasional ke alat apa pun di situs ini."
        items={[
          "Gunakan data contoh atau data yang aman untuk publik.",
          "Catatan dan impor data berbasis browser dapat tersimpan di perangkat, tetapi pengguna tetap bertanggung jawab atas data yang dimasukkan.",
          "bece.asia bukan perwakilan instansi pemerintah dan tidak menggantikan sistem resmi.",
          "Jika alat memakai dataset referensi, hasilnya tetap perlu divalidasi ke sumber resmi."
        ]}
      />
    </PageShell>
  );
}
