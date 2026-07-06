import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function PrivacyPage() {
  return (
    <PageShell locale="en" currentPath="/privacy">
      <BasicPage
        title="Privacy"
        description="bece.asia is designed for public-safe utilities. Do not submit confidential, personal, official, or operational data into any tool on this site."
        items={[
          "Tools should run with sample or public-safe data only.",
          "Browser-based notes and imports may stay on your device, but users remain responsible for the data they enter.",
          "bece.asia does not represent a government agency and does not replace official systems.",
          "When a tool links to or embeds a reference dataset, validate results against official sources before use."
        ]}
      />
    </PageShell>
  );
}
