import { Component, ReactNode, ErrorInfo } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null; info: ErrorInfo | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info });
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-3xl mx-auto p-8">
          <div className="glass-strong rounded-2xl p-6 border-l-4 border-accent-coral">
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-coral mb-2">
              page crashed
            </p>
            <h2 className="font-display text-xl mb-3">
              {this.state.error.name}: {this.state.error.message}
            </h2>
            {this.state.error.stack && (
              <pre className="text-[10px] font-mono text-ink-300 whitespace-pre-wrap overflow-auto max-h-64 bg-ink-950/60 rounded p-3">
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
