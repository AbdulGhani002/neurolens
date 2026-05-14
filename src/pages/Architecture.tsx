import PageShell from "../components/PageShell";

export default function Architecture() {
  return (
    <PageShell
      eyebrow="Module · 01"
      title="Architecture Explorer"
      subtitle="Interactive diagrams of BERT (encoder-only) and T5 (encoder-decoder). Click any block to inspect what it does."
    >
      <div className="glass rounded-2xl p-10 text-ink-300">
        Coming up next — full BERT &amp; T5 architecture diagrams.
      </div>
    </PageShell>
  );
}
