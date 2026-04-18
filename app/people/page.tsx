"use client";

import Link from "next/link";

import { Badge } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";
import { sourceLabel } from "@/components/Investigation/utils";

export default function PeoplePage() {
	const { people, byPerson, events } = useInvestigation();

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-4">
				<section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
					<div className="flex items-center justify-between gap-3">
						<SectionTitle>People</SectionTitle>
						<span className="text-xs text-zinc-600 dark:text-zinc-400">
							{people.length} total
						</span>
					</div>

					<div className="mt-3 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-900">
						<ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
							{people.length ? (
								people.map((person) => {
									const indices = byPerson.get(person.key) ?? [];
									const latest = indices.length ? events[indices[0]!] : null;

									return (
										<li key={person.key}>
											<Link
												href={`/people/${encodeURIComponent(person.label)}`}
												className="flex flex-col gap-1 px-3 py-2 text-left text-sm bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950"
											>
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0">
														<div className="flex min-w-0 items-baseline gap-2">
															<span className="truncate font-medium text-zinc-900 dark:text-zinc-50">
																{person.label}
															</span>
													</div>

													{latest?.content ? (
														<p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
															{`Last Activity: ${latest.content}`}
														</p>
													) : null}
												</div>

												{latest ? (
													<div className="shrink-0 text-right">
														<div className="text-[11px] text-zinc-500 dark:text-zinc-400">
															Latest
														</div>
														<div className="text-xs text-zinc-700 dark:text-zinc-300">
															{latest.timestampText}
														</div>
													</div>
												) : null}
											</div>

												<div className="flex flex-wrap items-center gap-2">
													<Badge>{person.count} records</Badge>
													{latest?.reliability ? <Badge> Reliability: {latest.reliability}</Badge> : null}
													{latest?.location ? <Badge>Last seen at: {latest.location}</Badge> : null}
												</div>
											</Link>
										</li>
									);
								})
							) : (
								<li className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
									No people found in loaded records.
								</li>
							)}
						</ul>
					</div>
				</section>
			</main>
		</div>
	);
}

