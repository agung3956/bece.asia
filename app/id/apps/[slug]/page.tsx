import { AppDetailContent } from "@/components/app-detail-content";
import { PageShell } from "@/components/page-shell";
import { apps } from "@/data/apps";

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export default async function IndonesianAppDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PageShell locale="id" currentPath={`/id/apps/${slug}`}>
      <AppDetailContent locale="id" slug={slug} />
    </PageShell>
  );
}
