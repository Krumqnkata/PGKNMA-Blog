export const EVENT_CATEGORY_STYLES: Record<string, string> = {
  Academic: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Sports: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  Arts: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Community: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Holiday: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  Other: "border-gray-500/20 bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  Academic: "Академично",
  Sports: "Спортно",
  Arts: "Изкуства",
  Community: "Общностно",
  Holiday: "Празник",
  Other: "Друго",
};

export function getEventCategoryStyle(category: string) {
  return EVENT_CATEGORY_STYLES[category] ?? "bg-muted text-muted-foreground";
}

export function getEventCategoryLabel(category: string) {
  return EVENT_CATEGORY_LABELS[category] ?? category;
}