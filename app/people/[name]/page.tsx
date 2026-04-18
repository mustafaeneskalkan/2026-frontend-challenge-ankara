"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";
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
	const latest = indices.length ? events[indices[0]!] : null;

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

				<section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<SectionTitle>{person?.label ?? decodedName}</SectionTitle>
							<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
								{person
									? "Person details coming soon."
									: "This person was not found in loaded records."}
							</p>
						</div>

						<div className="flex shrink-0 flex-wrap items-center gap-2">
							{person ? <Badge>{person.count} records</Badge> : null}
							{latest ? <Badge>{latest.timestampText}</Badge> : null}
							{latest?.location ? <Badge>{latest.location}</Badge> : null}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
