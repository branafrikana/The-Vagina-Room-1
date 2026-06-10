import { Component, ErrorInfo, ReactNode } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Log to Firebase
    addDoc(collection(db, "errorLogs"), {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    }).catch((e) => console.error("Failed to log error to Firebase", e));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-black text-brand-gold p-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          <h1 className="text-2xl font-bold uppercase tracking-widest">Something went wrong.</h1>
          <p className="mt-4 font-mono text-sm opacity-70">Our team has been notified. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}
