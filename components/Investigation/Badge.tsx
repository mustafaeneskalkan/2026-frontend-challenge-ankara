import type { ReactNode } from "react";
import type { InvestigationSource } from "@/lib/investigation";

export type BadgeColor =
  | "zinc"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet";

const COLOR_CLASS: Record<BadgeColor, string> = {
  zinc: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
  blue: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-700/40 dark:bg-blue-600/18 dark:text-blue-200",
  green:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-700/40 dark:bg-emerald-600/18 dark:text-emerald-200",
  amber:
    "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-700/40 dark:bg-amber-600/20 dark:text-amber-200",
  red: "border-red-200 bg-red-100 text-red-800 dark:border-red-700/40 dark:bg-red-600/18 dark:text-red-200",
  violet:
    "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-700/40 dark:bg-violet-600/18 dark:text-violet-200",
};

export function sourceBadgeColor(source: InvestigationSource): BadgeColor {
  switch (source) {
    case "sightings":
      return "blue";
    case "checkins":
      return "green";
    case "messages":
      return "violet";
    case "personal-notes":
      return "amber";
    case "anonymous-tips":
      return "red";
    default:
      return "zinc";
  }
}

export function Badge({
  children,
  color = "zinc",
}: {
  children: ReactNode;
  color?: BadgeColor;
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " +
        COLOR_CLASS[color]
      }
    >
      {children}
    </span>
  );
}
