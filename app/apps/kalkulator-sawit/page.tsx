import { PageShell } from "@/components/page-shell";
import { PalmOilCalculatorClient } from "@/components/palm-oil-calculator-client";

export default function PalmOilCalculatorPage() {
  return (
    <PageShell locale="id" currentPath="/apps/kalkulator-sawit">
      <PalmOilCalculatorClient />
    </PageShell>
  );
}
