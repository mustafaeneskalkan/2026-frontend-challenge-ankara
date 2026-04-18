"use client";

import { useMemo } from "react";

import { Badge } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";
import { pickEventTitle } from "@/components/Investigation/utils";

export default function CheckingsPage() {
	const { events } = useInvestigation();

	const filtered = useMemo(
		() => events.filter((evt) => evt.source === "checkins"),
		[events],
	);

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-4">
				<section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
					<div className="flex items-center justify-between gap-3">
						<SectionTitle>Checkings</SectionTitle>
						<span className="text-xs text-zinc-600 dark:text-zinc-400">
							{filtered.length} records
						</span>
					</div>

					<div className="mt-3 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-900">
						<ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
							{filtered.length ? (
								filtered.map((evt) => (
									<li key={evt.key} className="px-3 py-2">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
													{pickEventTitle(evt)}
												</div>
												{evt.content ? (
													<p className="mt-0.5 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
														{evt.content}
													</p>
												) : null}
											</div>

											<div className="shrink-0 text-right">
												<div className="text-xs text-zinc-500 dark:text-zinc-400">
													{evt.timestampText || "—"}
												</div>
											</div>
										</div>

										<div className="mt-2 flex flex-wrap items-center gap-2">
											<Badge color="green">Checkins</Badge>
											{evt.reliability ? <Badge>{evt.reliability}</Badge> : null}
											{evt.location ? <Badge>{evt.location}</Badge> : null}
										</div>
									</li>
								))
							) : (
								<li className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
									No checkins found in loaded records.
								</li>
							)}
						</ul>
					</div>
				</section>
			</main>
		</div>
	);
}
