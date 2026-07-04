import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function FeedbackPage() {
  return (
    <PageShell locale="en" currentPath="/feedback">
      <BasicPage
        title="Feedback"
        description="Feedback channels will be connected after the first public release."
        items={["App idea", "Bug report", "Feature request", "Content correction", "Workflow suggestion", "Integration request"]}
      />
    </PageShell>
  );
}
