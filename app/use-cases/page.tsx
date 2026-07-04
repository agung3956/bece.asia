import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function UseCasesPage() {
  return (
    <PageShell locale="en" currentPath="/use-cases">
      <BasicPage
        title="Use Cases"
        description="Practical scenarios for using bece.asia tools in daily work."
        items={["Document workflow", "Program monitoring", "Export support", "Research workspace", "Learning tools", "Office utilities"]}
      />
    </PageShell>
  );
}
