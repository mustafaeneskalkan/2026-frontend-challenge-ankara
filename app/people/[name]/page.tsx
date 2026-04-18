"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge, sourceBadgeColor } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";
import { sourceLabel } from "@/components/Investigation/utils";
import LeafletMap from "@/components/LeafletMap";
import { PersonCard } from "@/components/PersonCard";
import { normalizePersonName } from "@/lib/investigation";

function safeDecodeURIComponent(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function hasUsableCoordinates(
	coords: { lat: number; lng: number } | null,
): coords is { lat: number; lng: number } {
	if (!coords) return false;
	if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return false;
	if (coords.lat < -90 || coords.lat > 90) return false;
	if (coords.lng < -180 || coords.lng > 180) return false;
	// Many form providers send a placeholder when coordinates are missing.
	if (coords.lat === 0 && coords.lng === 0) return false;
	return true;
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
	const markers = personEvents
		.filter(
			(
				evt,
			): evt is (typeof personEvents)[number] & {
				coordinates: { lat: number; lng: number };
			} => hasUsableCoordinates(evt.coordinates),
		)
		.map((evt) => {
			const source = sourceLabel(evt.source);
			const title = evt.location ?? source;
			const subtitle = `${source} • ${evt.timestampText}`;
			const color = sourceBadgeColor(evt.source);

			return {
				key: evt.key,
				position: evt.coordinates,
				title,
				subtitle,
				color,
				popup: (
					<div className="min-w-[220px] max-w-[280px] space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge color={color}>{source}</Badge>
							{evt.reliability ? (
								<Badge color="amber">{evt.reliability}</Badge>
							) : null}
						</div>

						<dl className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-xs">
							<dt className="text-zinc-500 dark:text-zinc-400">
								Time
							</dt>
							<dd className="text-zinc-900 dark:text-zinc-50">
								{evt.timestampText || "—"}
							</dd>

							<dt className="text-zinc-500 dark:text-zinc-400">
								Location
							</dt>
							<dd className="text-zinc-900 dark:text-zinc-50">
								{evt.location ?? "—"}
							</dd>

							<dt className="text-zinc-500 dark:text-zinc-400">
								People
							</dt>
							<dd className="text-zinc-900 dark:text-zinc-50">
								{evt.people.length ? (
									evt.people.map((name, idx) => (
										<span key={`${evt.key}:person:${idx}`}>
											<Link
												href={`/people/${encodeURIComponent(name)}`}
												className="underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
											>
												{name}
											</Link>
											{idx < evt.people.length - 1 ? ", " : null}
										</span>
									))
								) : (
									"—"
								)}
							</dd>
						</dl>

						{evt.content ? (
							<div>
								<p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-50">
									{evt.content}
								</p>
							</div>
						) : null}
					</div>
				),
			};
		});
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

				{markers.length ? (
					<section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
						<div className="flex items-center justify-between gap-3">
							<SectionTitle>Records Map</SectionTitle>
						</div>

						<div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-900">
							<LeafletMap
								markers={markers}
								className="h-80 w-full"
							/>
						</div>
					</section>
				) : null}

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
													<Badge color={sourceBadgeColor(evt.source)}>
														{sourceLabel(evt.source)}
													</Badge>
													{evt.reliability ? (
														<Badge color="amber">{evt.reliability}</Badge>
													) : null}
													{evt.location ? (
														<Badge color="blue">{evt.location}</Badge>
													) : null}
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
