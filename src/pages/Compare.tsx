import PageShell from "../components/PageShell";

export default function Compare() {
  return (
    <PageShell
      eyebrow="Module · 05"
      title="BERT vs T5"
      subtitle="Same input, two architectures. See how an encoder-only stack behaves next to a full encoder-decoder."
    >
      <div className="glass rounded-2xl p-10 text-ink-300">Coming up next — split-pane comparison.</div>
    </PageShell>
  );
}
