import { DisclaimerBlock } from "@/components/disclaimer-block";
import { HeroHeader } from "@/components/hero-header";
import { PageShell } from "@/components/page-shell";

export default function DisclaimerPage() {
  return (
    <PageShell maxWidth="standard" className="space-y-6">
      <HeroHeader
        eyebrow="Research Terms"
        title="Disclaimer"
        subtitle="MacroScope is an educational macro dashboard and market regime tracker."
      />
      <DisclaimerBlock />
    </PageShell>
  );
}
