# NeuroLens

> See inside NLP models.

An interactive visualizer for **BERT** and **T5** built for the NUTECH NLP Lab (Lab 10 — Translation & Summarization). Every graphic is hand-rendered SVG — no stock images, no emojis, no icon fonts.

## Modules

| # | Module | What you can do |
|---|--------|------------------|
| 01 | Architecture Explorer | Step through BERT (encoder-only) and T5 (encoder-decoder) block by block |
| 02 | Attention Visualizer | See all heads of an encoder layer light up as you change the input |
| 03 | Tokenizer Playground | Compare WordPiece, SentencePiece, and BPE on the same sentence |
| 04 | Embedding Space | 2-D projection of word vectors with semantic neighbours |
| 05 | BERT vs T5 | Same input, two architectures, side-by-side |
| 06 | Why not BERT? | Demonstrates where the encoder-only stack breaks for generation |

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (custom dark theme, gradient brand)
- **Framer Motion** for transitions and inline animations
- **Pure SVG** for every diagram — no canvas, no third-party chart libs in the architecture views

## Run locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Project context

Built as the Lab 10 deliverable by a 5-person team at NUTECH Islamabad (AI-23 batch). The brief is to study T5 for summarization and translation and explain why BERT is not used for generation — this app makes those concepts *visible* rather than diagrammatic.

## Authors

NUTECH AI-23 · NLP Lab 10 team.
