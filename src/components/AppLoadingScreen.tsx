import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, RefreshCw, WifiOff } from "lucide-react";

import { PencilLoader } from "@/components/art/PencilLoader";
import { Button } from "@/components/ui/button";
import { getRouteLoadingInfo } from "@/lib/route-labels";
import { cn } from "@/lib/utils";

const SLOW_AFTER_MS = 5_000;
const STUCK_AFTER_MS = 15_000;

type StepState = "done" | "active" | "pending";

const StepIcon = ({ state }: { state: StepState }) => {
  if (state === "done") return <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />;
  if (state === "active") return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />;
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />;
};

interface AppLoadingScreenProps {
  /** Full screen while the app shell itself is missing; inline inside the site layout otherwise. */
  fullScreen?: boolean;
}

/**
 * Shown while a page's code is downloading. It names the page and lists what happens next,
 * so visitors know what they are waiting for instead of staring at a bare spinner.
 */
export default function AppLoadingScreen({ fullScreen = true }: AppLoadingScreenProps) {
  // Rendered both inside and outside the router, so read the address directly.
  const { title, content } = getRouteLoadingInfo(window.location.pathname);
  const [elapsed, setElapsed] = useState<"normal" | "slow" | "stuck">("normal");
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const slowTimer = window.setTimeout(() => setElapsed("slow"), SLOW_AFTER_MS);
    const stuckTimer = window.setTimeout(() => setElapsed("stuck"), STUCK_AFTER_MS);
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.clearTimeout(slowTimer);
      window.clearTimeout(stuckTimer);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const steps: { label: string; state: StepState }[] = [
    { label: "Връзка със сайта", state: "done" },
    { label: `Изтегляне на страница „${title}“`, state: "active" },
    ...(content ? [{ label: `Зареждане на ${content}`, state: "pending" as const }] : []),
  ];

  return (
    <div
      id={fullScreen ? "main-content" : undefined}
      tabIndex={fullScreen ? -1 : undefined}
      className={cn(
        "flex flex-col items-center justify-center gap-6 bg-background px-6 text-foreground outline-none",
        fullScreen ? "min-h-screen" : "min-h-[60vh] py-16",
      )}
      role="status"
      aria-live="polite"
    >
      <PencilLoader />

      <div className="text-center">
        <p className="text-lg font-black tracking-tight">Отваряме „{title}“</p>
        <p className="mt-1 text-sm text-muted-foreground">Какво изчакваме в момента:</p>
      </div>

      <ol className="w-full max-w-xs space-y-2.5 rounded-2xl border border-border/70 bg-card/70 p-4 text-sm shadow-sm">
        {steps.map(({ label, state }) => (
          <li
            key={label}
            className={cn("flex items-center gap-2.5", state === "pending" ? "text-muted-foreground" : "font-medium")}
            aria-current={state === "active" ? "step" : undefined}
          >
            <StepIcon state={state} />
            <span>{label}</span>
          </li>
        ))}
      </ol>

      {!online ? (
        <p className="flex max-w-xs items-center gap-2 text-center text-sm font-medium text-destructive">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          Няма връзка с интернет. Ще продължим, когато се свържете отново.
        </p>
      ) : elapsed !== "normal" && (
        <div className="flex max-w-xs flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          <p>
            {elapsed === "slow"
              ? "Връзката изглежда бавна — още малко търпение."
              : "Зареждането отнема необичайно дълго."}
          </p>
          {elapsed === "stuck" && (
            <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Презареди страницата
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
