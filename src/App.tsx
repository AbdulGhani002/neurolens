import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Architecture from "./pages/Architecture";
import Attention from "./pages/Attention";
import Tokenizer from "./pages/Tokenizer";
import Embeddings from "./pages/Embeddings";
import Compare from "./pages/Compare";
import WhyNotBert from "./pages/WhyNotBert";

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/attention" element={<Attention />} />
            <Route path="/tokenizer" element={<Tokenizer />} />
            <Route path="/embeddings" element={<Embeddings />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/why-not-bert" element={<WhyNotBert />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
