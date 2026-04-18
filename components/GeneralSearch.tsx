"use client";

import Fuse from "fuse.js";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useInvestigation } from "@/components/Investigation/InvestigationContext";
import { pickEventTitle } from "@/components/Investigation/utils";
import { buildChatThreads } from "@/lib/chats";

type PersonResult = {
	kind: "person";
	key: string;
	label: string;
	subLabel: string;
	count: number;
	href: string;
};

type MessageThreadResult = {
	kind: "message";
	key: string;
	label: string;
	subLabel: string;
	count: number;
	when: string | null;
	href: string;
};

type EventResult = {
	kind: "sighting" | "checking";
	key: string;
	label: string;
	subLabel: string;
	when: string | null;
	href: string;
};

type SearchResult = PersonResult | MessageThreadResult | EventResult;

type SearchSection = {
	title: string;
	items: SearchResult[];
};

function normalizeQuery(input: string): string {
	return input.trim().toLowerCase();
}

export default function GeneralSearch() {
	const { people, events } = useInvestigation();
	const router = useRouter();
	const listboxId = "general-search-listbox";

	const rootRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const personItems = useMemo(() => {
		return people.map((p) => ({
			key: p.key,
			label: p.label,
			count: p.count,
			searchLabel: normalizeQuery(p.label),
		}));
	}, [people]);

	const messageThreads = useMemo(() => {
		const messageEvents = events.filter((evt) => evt.source === "messages");
		return buildChatThreads(messageEvents);
	}, [events]);

	const messageItems = useMemo(() => {
		return messageThreads.map((t) => {
			const a = t.participants.a.label;
			const b = t.participants.b.label;
			const label = `${a} ↔ ${b}`;
			return {
				key: t.id,
				label,
				subLabel: t.lastContent ?? "No message content.",
				count: t.count,
				when: t.lastTimestampText ?? null,
				href: `/messages/${encodeURIComponent(t.id)}`,
				searchLabel: normalizeQuery(`${a} ${b} ${t.lastContent ?? ""}`),
			};
		});
	}, [messageThreads]);

	const sightingsItems = useMemo(() => {
		return events
			.filter((evt) => evt.source === "sightings")
			.map((evt) => ({
				key: evt.key,
				label: pickEventTitle(evt),
				subLabel: evt.content ?? "No additional details.",
				when: evt.timestampText ?? null,
				href: "/sightings",
				people: evt.people,
				location: evt.location,
				content: evt.content,
				searchLabel: normalizeQuery(
					`${evt.people.join(" ")} ${evt.location ?? ""} ${evt.content ?? ""}`,
				),
			}));
	}, [events]);

	const checkingsItems = useMemo(() => {
		return events
			.filter((evt) => evt.source === "checkins")
			.map((evt) => ({
				key: evt.key,
				label: pickEventTitle(evt),
				subLabel: evt.content ?? "No additional details.",
				when: evt.timestampText ?? null,
				href: "/checkings",
				people: evt.people,
				location: evt.location,
				content: evt.content,
				searchLabel: normalizeQuery(
					`${evt.people.join(" ")} ${evt.location ?? ""} ${evt.content ?? ""}`,
				),
			}));
	}, [events]);

	const peopleFuse = useMemo(() => {
		return new Fuse(personItems, {
			includeScore: true,
			threshold: 0.35,
			ignoreLocation: true,
			minMatchCharLength: 2,
			keys: [
				{ name: "label", weight: 0.8 },
				{ name: "searchLabel", weight: 0.15 },
				{ name: "key", weight: 0.05 },
			],
		});
	}, [personItems]);

	const messagesFuse = useMemo(() => {
		return new Fuse(messageItems, {
			includeScore: true,
			threshold: 0.35,
			ignoreLocation: true,
			minMatchCharLength: 2,
			keys: [
				{ name: "label", weight: 0.7 },
				{ name: "subLabel", weight: 0.15 },
				{ name: "searchLabel", weight: 0.15 },
			],
		});
	}, [messageItems]);

	const sightingsFuse = useMemo(() => {
		return new Fuse(sightingsItems, {
			includeScore: true,
			threshold: 0.38,
			ignoreLocation: true,
			minMatchCharLength: 2,
			keys: [
				{ name: "label", weight: 0.35 },
				{ name: "content", weight: 0.35 },
				{ name: "location", weight: 0.15 },
				{ name: "people", weight: 0.1 },
				{ name: "searchLabel", weight: 0.05 },
			],
		});
	}, [sightingsItems]);

	const checkingsFuse = useMemo(() => {
		return new Fuse(checkingsItems, {
			includeScore: true,
			threshold: 0.38,
			ignoreLocation: true,
			minMatchCharLength: 2,
			keys: [
				{ name: "label", weight: 0.35 },
				{ name: "content", weight: 0.35 },
				{ name: "location", weight: 0.15 },
				{ name: "people", weight: 0.1 },
				{ name: "searchLabel", weight: 0.05 },
			],
		});
	}, [checkingsItems]);

	const sections = useMemo<SearchSection[]>(() => {
		const needle = normalizeQuery(query);
		if (!needle) return [];

		const peopleHits = peopleFuse.search(needle, { limit: 5 });
		const messageHits = messagesFuse.search(needle, { limit: 4 });
		const sightingHits = sightingsFuse.search(needle, { limit: 3 });
		const checkingHits = checkingsFuse.search(needle, { limit: 3 });

		const peopleResults: PersonResult[] = peopleHits
			.sort((a, b) => (a.score ?? 1) - (b.score ?? 1) || b.item.count - a.item.count)
			.map((h) => ({
				kind: "person",
				key: h.item.key,
				label: h.item.label,
				subLabel: h.item.key,
				count: h.item.count,
				href: `/people/${encodeURIComponent(h.item.label)}`,
			}));

		const messageResults: MessageThreadResult[] = messageHits
			.sort((a, b) => (a.score ?? 1) - (b.score ?? 1) || b.item.count - a.item.count)
			.map((h) => ({
				kind: "message",
				key: h.item.key,
				label: h.item.label,
				subLabel: h.item.subLabel,
				count: h.item.count,
				when: h.item.when,
				href: h.item.href,
			}));

		const sightingResults: EventResult[] = sightingHits
			.sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
			.map((h) => ({
				kind: "sighting",
				key: h.item.key,
				label: h.item.label,
				subLabel: h.item.subLabel,
				when: h.item.when,
				href: h.item.href,
			}));

		const checkingResults: EventResult[] = checkingHits
			.sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
			.map((h) => ({
				kind: "checking",
				key: h.item.key,
				label: h.item.label,
				subLabel: h.item.subLabel,
				when: h.item.when,
				href: h.item.href,
			}));

		const next: SearchSection[] = [];
		if (peopleResults.length) next.push({ title: "People", items: peopleResults });
		if (messageResults.length) next.push({ title: "Messages", items: messageResults });
		if (sightingResults.length) next.push({ title: "Sightings", items: sightingResults });
		if (checkingResults.length) next.push({ title: "Checkings", items: checkingResults });
		return next;
	}, [peopleFuse, messagesFuse, sightingsFuse, checkingsFuse, query]);

	const sectionsWithIndices = useMemo(() => {
		let optionIndex = 0;
		return sections.map((section) => {
			const items = section.items.map((item) => ({
				item,
				optionIndex: optionIndex++,
			}));
			return { title: section.title, items };
		});
	}, [sections]);

	const flatOptions = useMemo(() => {
		return sectionsWithIndices.flatMap((section) => section.items);
	}, [sectionsWithIndices]);

	useEffect(() => {
		setActiveIndex((prev) => {
			if (flatOptions.length === 0) return 0;
			return Math.max(0, Math.min(prev, flatOptions.length - 1));
		});
	}, [flatOptions.length]);

	useEffect(() => {
		function onPointerDown(event: MouseEvent) {
			const root = rootRef.current;
			if (!root) return;
			if (event.target instanceof Node && root.contains(event.target)) return;
			setOpen(false);
		}

		window.addEventListener("mousedown", onPointerDown);
		return () => window.removeEventListener("mousedown", onPointerDown);
	}, []);

	const disabled = events.length === 0;
	const showDropdown = open && !disabled && flatOptions.length > 0;
	const activeOptionId = showDropdown
		? `general-search-option-${flatOptions[activeIndex]?.item.kind ?? ""}-${flatOptions[activeIndex]?.item.key ?? ""}`
		: undefined;

	function goToResult(item: SearchResult) {
		setOpen(false);
		setQuery("");
		router.push(item.href);
	}

	return (
		<div ref={rootRef} className="relative w-full">
			<div className="flex w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-900 dark:bg-black dark:text-zinc-50">
				<input
					ref={inputRef}
					type="text"
					value={query}
					disabled={disabled}
					onChange={(e) => {
						setQuery(e.target.value);
						setActiveIndex(0);
						setOpen(true);
					}}
					onFocus={() => {
						setActiveIndex(0);
						setOpen(true);
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setOpen(false);
							return;
						}
						if (!flatOptions.length) return;
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setActiveIndex((prev) => Math.min(prev + 1, flatOptions.length - 1));
							return;
						}
						if (e.key === "ArrowUp") {
							e.preventDefault();
							setActiveIndex((prev) => Math.max(prev - 1, 0));
							return;
						}
						if (e.key === "Enter") {
							e.preventDefault();
							const hit = flatOptions[activeIndex]?.item;
							if (hit) goToResult(hit);
						}
					}}
					placeholder={
						disabled
							? "Load records to search…"
							: "Search people, messages, sightings, checkings…"
					}
					className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed dark:placeholder:text-zinc-400"
					aria-label="Search"
					role="combobox"
					aria-expanded={open}
					aria-controls={listboxId}
					aria-autocomplete="list"
					aria-activedescendant={activeOptionId}
					autoComplete="off"
					spellCheck={false}
				/>

				{query ? (
					<button
						type="button"
						onClick={() => {
							setQuery("");
							setOpen(false);
							inputRef.current?.focus();
						}}
						className="shrink-0 rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-950 dark:hover:text-zinc-50"
					>
						Clear
					</button>
				) : null}
			</div>

			{open && !disabled && query && flatOptions.length === 0 ? (
				<div className="absolute z-[9999] mt-2 w-full rounded-md border border-zinc-200 bg-white p-2 text-sm text-zinc-600 shadow-sm dark:border-zinc-900 dark:bg-black dark:text-zinc-400">
					No matches.
				</div>
			) : null}

			{showDropdown ? (
				<div className="absolute z-[9999] mt-2 w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-black">
					<ul
						id={listboxId}
						role="listbox"
						className="divide-y divide-zinc-200 dark:divide-zinc-900"
					>
						{sectionsWithIndices.flatMap((section) => {
							const header = (
								<li key={`section:${section.title}`} role="presentation">
									<div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										{section.title}
									</div>
								</li>
							);

							const options = section.items.map(({ item, optionIndex }) => {
								const active = optionIndex === activeIndex;
								const optionId = `general-search-option-${item.kind}-${item.key}`;

								const rightText =
									item.kind === "person"
										? `${item.count} records`
										: item.kind === "message"
											? `${item.count} messages`
											: "";

								const whenText =
									item.kind === "message" || item.kind === "sighting" || item.kind === "checking"
										? item.when
										: null;

								return (
									<li
										key={`${item.kind}:${item.key}`}
										id={optionId}
										role="option"
										aria-selected={active}
									>
										<button
											type="button"
											onMouseEnter={() => setActiveIndex(optionIndex)}
											onClick={() => goToResult(item)}
										className={
											"flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm " +
											(active
												? "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
												: "bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950 dark:hover:text-zinc-50")
										}
									>
										<div className="min-w-0">
											<div className="truncate font-medium">{item.label}</div>
											<div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
												{item.subLabel}
											</div>
										</div>

										<div className="shrink-0 text-right">
											{whenText ? (
												<div className="text-xs text-zinc-500 dark:text-zinc-400">
													{whenText}
												</div>
											) : null}
											{rightText ? (
												<div className="text-xs text-zinc-500 dark:text-zinc-400">
													{rightText}
												</div>
											) : null}
										</div>
									</button>
								</li>
							);
							});

							return [header, ...options];
						})}
					</ul>
				</div>
			) : null}
		</div>
	);
}
