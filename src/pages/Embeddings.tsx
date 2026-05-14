import PageShell from "../components/PageShell";

export default function Embeddings() {
  return (
    <PageShell
      eyebrow="Module · 04"
      title="Embedding Space"
      subtitle="Word vectors projected into 2D. Hover for neighbours; try vector arithmetic."
    >
      <div className="glass rounded-2xl p-10 text-ink-300">Coming up next — interactive scatter.</div>
    </PageShell>
  );
}
