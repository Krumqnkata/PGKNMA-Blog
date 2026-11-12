import { Sparkles } from "lucide-react";

interface AISummaryBoxProps {
  summary?: string | null;
}

/** „Накратко“: the AI summary at the top of an article. Renders nothing when empty. */
const AISummaryBox = ({ summary }: AISummaryBoxProps) => {
  const text = summary?.trim();
  if (!text) return null;

  return (
    <section
      aria-labelledby="ai-summary-heading"
      className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5"
    >
      <h2
        id="ai-summary-heading"
        className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Накратко
      </h2>
      <p className="text-pretty font-reading text-base leading-relaxed text-foreground">{text}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Обобщено с изкуствен интелект — може да съдържа неточности. Пълният текст е по-долу.
      </p>
    </section>
  );
};

export default AISummaryBox;
