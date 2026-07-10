import { CommunityAppFrame } from "@/components/community-app-frame";
import { PageShell } from "@/components/page-shell";

export default function NusantaraGamesPage() {
  return (
    <PageShell locale="id" currentPath="/apps/nusantara-games">
      <CommunityAppFrame title="Nusantara Games" app="nusantara-games" sourceRepo="https://github.com/agung3956/nusantara-games" />
    </PageShell>
  );
}
