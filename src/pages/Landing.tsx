import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroIllustration from "../components/graphics/HeroIllustration";

const features = [
  {
    to: "/architecture",
    title: "Architecture Explorer",
    desc: "Tap any block in BERT or T5 and see what it actually does. Encoder stacks, decoder stacks, residuals, layer norms — all interactive.",
    accent: "from-accent-cyan/60 to-accent-cyan/0",
    pos: { x: 20, y: 30 },
  },
  {
    to: "/attention",
    title: "Attention Visualizer",
    desc: "See all 12 heads of an encoder layer light up as you change the input. Pick a token, watch where it looks.",
    accent: "from-accent-violet/60 to-accent-violet/0",
    pos: { x: 70, y: 60 },
  },
  {
    to: "/tokenizer",
    title: "Tokenizer Playground",
    desc: "Type any sentence and see WordPiece, SentencePiece, and BPE break it apart side by side. Watch sub-word units form.",
    accent: "from-accent-coral/60 to-accent-coral/0",
    pos: { x: 30, y: 75 },
  },
  {
    to: "/embeddings",
    title: "Embedding Space",
    desc: "Hundreds of words projected into 2D — see king − man + woman ≈ queen with your own eyes, not in a slide.",
    accent: "from-accent-amber/60 to-accent-amber/0",
    pos: { x: 80, y: 25 },
  },
  {
    to: "/compare",
    title: "BERT vs T5",
    desc: "Same input, both models. See how an encoder-only stack behaves vs a full encoder-decoder on summarization & translation.",
    accent: "from-accent-cyan/60 to-accent-violet/0",
    pos: { x: 50, y: 50 },
  },
  {
    to: "/why-not-bert",
    title: "Why not BERT for generation?",
    desc: "Watch BERT try to translate and fail. See exactly which step in the architecture breaks when generation is required.",
    accent: "from-accent-coral/60 to-accent-amber/0",
    pos: { x: 15, y: 55 },
  },
];

export default function Landing() {
  return (
    <div className="relative">
      {/* hero */}
      <section className="relative grid-bg">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono uppercase tracking-[0.25em] text-accent-cyan mb-5"
            >
              NLP Lab 10 · Translation &amp; Summarization
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display font-extrabold text-5xl md:text-6xl leading-[1.05] mb-6"
            >
              <span className="gradient-text">See inside</span>
              <br />
              <span className="text-ink-50">NLP models.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-ink-200 text-lg leading-relaxed mb-8 max-w-xl"
            >
              <span className="font-display font-semibold text-ink-50">NeuroLens</span> is an
              interactive playground for understanding how BERT and T5 actually work — token by
              token, head by head, layer by layer. Built for students who&apos;d rather
              <span className="text-accent-cyan"> see </span>
              attention than read another diagram about it.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/architecture"
                className="px-6 py-3 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-violet text-ink-950 font-semibold hover:shadow-glow transition"
              >
                Explore architecture
              </Link>
              <Link
                to="/attention"
                className="px-6 py-3 rounded-xl border border-ink-600 text-ink-100 hover:border-accent-cyan hover:text-accent-cyan transition font-semibold"
              >
                Visualize attention
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 grid grid-cols-3 gap-4 max-w-md font-mono text-xs"
            >
              <Stat label="Modules" value="7" />
              <Stat label="Visualizations" value="20+" />
              <Stat label="SVG-rendered" value="100%" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* feature grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent-violet mb-2">
            Modules
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-50">
            Seven ways to look at the same model.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.to}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={f.to}
                className="group block glass rounded-2xl p-6 h-full hover:border-accent-cyan/40 transition relative overflow-hidden"
              >
                <div
                  className={`absolute -inset-px bg-gradient-radial ${f.accent} opacity-0 group-hover:opacity-100 transition pointer-events-none`}
                  style={{
                    background: `radial-gradient(circle at ${f.pos.x}% ${f.pos.y}%, rgba(94,228,212,0.18), transparent 60%)`,
                  }}
                />
                <div className="relative">
                  <h3 className="font-display font-semibold text-xl text-ink-50 mb-2 group-hover:text-accent-cyan transition">
                    {f.title}
                  </h3>
                  <p className="text-sm text-ink-300 leading-relaxed">{f.desc}</p>
                  <p className="mt-4 text-xs font-mono text-accent-cyan opacity-0 group-hover:opacity-100 transition">
                    open →
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <div className="text-2xl font-display font-bold gradient-text">{value}</div>
      <div className="text-ink-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
