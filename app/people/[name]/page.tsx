"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";
import { sourceLabel } from "@/components/Investigation/utils";
import { PersonCard } from "@/components/PersonCard";
import { normalizePersonName } from "@/lib/investigation";

function safeDecodeURIComponent(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export default function PersonPage() {
	const params = useParams();
	const raw = (params as Record<string, string | string[] | undefined>)?.name;
	const encodedKey = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
	const decodedName = safeDecodeURIComponent(encodedKey);
	const personKey = normalizePersonName(decodedName);

	const { people, byPerson, events } = useInvestigation();
	const person = people.find((p) => p.key === personKey) ?? null;

	const indices = byPerson.get(personKey) ?? [];
	const personEvents = indices.map((i) => events[i]!).filter(Boolean);
	const latest = personEvents[0] ?? null;
	const sources = Array.from(
		new Set(personEvents.map((evt) => sourceLabel(evt.source))),
	);
	const description = person
		? "Summary of all records linked to this person."
		: "This person was not found in loaded records.";

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-4">
				<div className="mb-4">
					<Link
						href="/people"
						className="text-sm text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
					>
						← Back to People
					</Link>
				</div>

				<PersonCard
					personKey={personKey}
					name={person?.label ?? decodedName}
					description={description}
					count={person ? person.count : personEvents.length ? personEvents.length : null}
					latestTimestampText={latest?.timestampText ?? null}
					latestLocation={latest?.location ?? null}
					sources={sources}
				/>

				<section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
					<div className="flex items-center justify-between">
						<SectionTitle>Timeline</SectionTitle>
						<span className="text-xs text-zinc-600 dark:text-zinc-400">
							Latest first
						</span>
					</div>

					{personEvents.length ? (
						<ol className="relative mt-4 border-s border-zinc-200 ps-4 dark:border-zinc-900">
							{personEvents.map((evt) => {
								const others = evt.people.filter(
									(p) => normalizePersonName(p) !== personKey,
								);
								return (
									<li
										key={evt.key}
										className="relative mb-6 ms-3 last:mb-0"
									>
										<div className="flex flex-col gap-2">
											<div className="flex flex-wrap items-center justify-between gap-2">
												<time className="text-xs text-zinc-500 dark:text-zinc-400">
													{evt.timestampText}
												</time>
												<div className="flex flex-wrap items-center gap-2">
													<Badge color="blue">{sourceLabel(evt.source)}</Badge>
													{evt.reliability ? (
														<Badge color="amber">{evt.reliability}</Badge>
													) : null}
													{evt.location ? <Badge>{evt.location}</Badge> : null}
												</div>
											</div>

											{evt.content ? (
												<p className="text-sm text-zinc-700 dark:text-zinc-300">
													{evt.content}
												</p>
											) : (
												<p className="text-sm text-zinc-500 dark:text-zinc-400">
													No additional details.
												</p>
											)}

											{others.length ? (
												<p className="text-xs text-zinc-600 dark:text-zinc-400">
													With: {others.join(", ")}
												</p>
											) : null}
										</div>
									</li>
								);
							})}
						</ol>
					) : (
						<p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
							No records found for this person.
						</p>
					)}
				</section>
			</main>
		</div>
	);
}
