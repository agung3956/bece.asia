import { CommunityAppFrame } from "@/components/community-app-frame";
import { PageShell } from "@/components/page-shell";

export default function FamilyMissionPage() {
  return (
    <PageShell locale="id" currentPath="/apps/family-mission">
      <CommunityAppFrame title="Family Mission" app="family-mission" sourceRepo="https://github.com/agung3956/hadiah-anak" />
    </PageShell>
  );
}
