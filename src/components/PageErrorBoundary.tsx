import { Component, createRef } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteArt } from "@/components/art/SiteArt";
import { ERROR_JOKES, pickRandom } from "@/lib/playful-messages";

interface PageErrorBoundaryProps {
  children: ReactNode;
  resetKey: string;
  variant?: "site" | "tv";
}

interface PageErrorBoundaryState {
  error: Error | null;
  joke?: string;
}

class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  state: PageErrorBoundaryState = { error: null };
  private fallbackRef = createRef<HTMLDivElement>();

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { error, joke: pickRandom(ERROR_JOKES) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Непредвидена грешка при визуализиране на страница:", error, info);
  }

  componentDidUpdate(previousProps: PageErrorBoundaryProps, previousState: PageErrorBoundaryState) {
    if (!previousState.error && this.state.error) this.fallbackRef.current?.focus();
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    const isTV = this.props.variant === "tv";
    return (
      <div
        ref={this.fallbackRef}
        tabIndex={-1}
        role="alert"
        aria-labelledby={`${this.props.resetKey}-error-title`}
        className={`flex min-h-[60vh] items-center justify-center px-4 py-16 outline-none ${isTV ? "min-h-screen bg-gray-950 text-white" : "bg-background text-foreground"}`}
      >
        <div className={`w-full max-w-lg rounded-2xl border p-6 text-center shadow-xl sm:p-10 ${isTV ? "border-gray-700 bg-gray-900" : "bg-card"}`}>
          <SiteArt name="pencil" className="mx-auto mb-5 block h-20 w-20" />
          <h1 id={`${this.props.resetKey}-error-title`} className="text-2xl font-bold sm:text-3xl">
            {isTV ? "TV екранът временно не е достъпен" : "Страницата не можа да се покаже"}
          </h1>
          {!isTV && <p className="mt-2 font-semibold">{this.state.joke}</p>}
          <p className={`mt-3 ${isTV ? "text-gray-300" : "text-muted-foreground"}`}>
            Възникна неочаквана грешка. Опитайте да презаредите или се върнете към началната страница.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={() => window.location.reload()} autoFocus>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Опитай отново
            </Button>
            <Button variant="outline" asChild className={isTV ? "border-gray-600 bg-transparent text-white hover:bg-gray-800 hover:text-white" : undefined}>
              <a href="/"><Home className="h-4 w-4" aria-hidden="true" />Към началото</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default PageErrorBoundary;
