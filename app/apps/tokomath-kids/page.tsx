import { CommunityAppFrame } from "@/components/community-app-frame";
import { PageShell } from "@/components/page-shell";

export default function TokoMathKidsPage() {
  return (
    <PageShell locale="id" currentPath="/apps/tokomath-kids">
      <CommunityAppFrame title="TokoMath Kids" app="tokomath-kids" sourceRepo="https://github.com/agung3956/tokomath-kids" />
    </PageShell>
  );
}
