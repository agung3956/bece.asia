import { HomeContent } from "@/components/home-content";
import { PageShell } from "@/components/page-shell";

export default function IndonesianHomePage() {
  return (
    <PageShell locale="id" currentPath="/id">
      <HomeContent locale="id" />
    </PageShell>
  );
}
