export function formatMonthlyViews(count: number | null | undefined): string {
  const normalizedCount = Number.isFinite(count)
    ? Math.max(0, Math.trunc(count as number))
    : 0;
  const noun = normalizedCount === 1 ? "преглеждане" : "преглеждания";
  return `${normalizedCount.toLocaleString("bg-BG")} ${noun} този месец`;
}
