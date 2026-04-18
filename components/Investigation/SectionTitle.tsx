import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </h2>
  );
}
