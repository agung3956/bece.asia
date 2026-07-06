import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function DisclaimerPage() {
  return (
    <PageShell locale="en" currentPath="/disclaimer">
      <BasicPage
        title="Disclaimer"
        description="bece.asia is an independent utility portal. It is not an official government website and does not provide binding legal, tariff, customs, procurement, or administrative decisions."
        items={[
          "All app outputs are informational and must be validated against official source documents.",
          "Branding, copy, and app data are sanitized for public use and should not imply institutional endorsement.",
          "Sensitive workflows are intentionally simplified before publication.",
          "If a tool appears to contain private or nonpublic information, stop using it and report it through the feedback page."
        ]}
      />
    </PageShell>
  );
}
