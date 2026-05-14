import PageShell from "../components/PageShell";

export default function Attention() {
  return (
    <PageShell
      eyebrow="Module · 02"
      title="Attention Visualizer"
      subtitle="Pick a token, see where it attends. Multi-head heatmaps for an encoder layer."
    >
      <div className="glass rounded-2xl p-10 text-ink-300">Coming up next — heatmaps.</div>
    </PageShell>
  );
}
