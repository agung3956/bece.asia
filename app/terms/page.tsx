import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";

export default function TermsPage() {
  return (
    <PageShell locale="en" currentPath="/terms">
      <BasicPage
        title="Terms"
        description="By using bece.asia, you agree to treat every app as an independent community utility for learning, productivity, and public-safe workflows."
        items={[
          "Use the tools as references, prototypes, or productivity aids only.",
          "Do not upload or enter restricted records, private identities, passwords, access tokens, or confidential operational information.",
          "Users are responsible for checking laws, regulations, tariffs, and procedures through official channels.",
          "Tools may change, be archived, or be replaced as apps are sanitized and moved into bece.asia."
        ]}
      />
    </PageShell>
  );
}
