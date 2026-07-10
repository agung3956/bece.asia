import { CommunityAppFrame } from "@/components/community-app-frame";
import { PageShell } from "@/components/page-shell";

export default function BintangPenjagaPage() {
  return (
    <PageShell locale="id" currentPath="/apps/bintang-penjaga">
      <CommunityAppFrame title="Bintang Penjaga" app="bintang-penjaga" sourceRepo="https://github.com/agung3956/bintang-penjaga" />
    </PageShell>
  );
}
