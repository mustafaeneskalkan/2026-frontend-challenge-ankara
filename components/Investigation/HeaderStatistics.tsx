"use client";

import { useInvestigation } from "@/components/Investigation/InvestigationContext";

export function InvestigationHeaderStatistics() {
  const { stats } = useInvestigation();

  const sourcesText = `${stats.sourcesApi}/${stats.sourcesTotal} sources`;
  const failedText = stats.sourcesFailed ? ` • ${stats.sourcesFailed} failed` : "";

  return (
    <div className="text-sm text-zinc-600 dark:text-zinc-400">
      <span className="font-medium text-zinc-900 dark:text-zinc-50">
        {stats.recordsTotal}
      </span>
      <span> records</span>
      <span className="mx-2">•</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-50">
        {stats.peopleTotal}
      </span>
      <span> people</span>
      <span className="mx-2">•</span>
      <span>{sourcesText}</span>
      <span>{failedText}</span>
    </div>
  );
}
