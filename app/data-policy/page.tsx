import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function DataPolicyPage() {
  return (
    <PageShell locale="en" currentPath="/data-policy">
      <BasicPage
        title="Data Policy"
        description="Published apps must be cleaned before they are listed or embedded on bece.asia."
        items={[
          "Remove names, IDs, internal document numbers, private endpoints, and nonpublic records.",
          "Use sample data, public references, or anonymized structures for demonstrations.",
          "Do not publish enforcement, intelligence, risk, coordinate, or restricted operational datasets.",
          "Every sensitive app should include a visible public-use notice and a reminder to validate official references."
        ]}
      />
    </PageShell>
  );
}
