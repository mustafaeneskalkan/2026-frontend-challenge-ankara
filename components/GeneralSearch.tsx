"use client";

import Fuse from "fuse.js";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useInvestigation } from "@/components/Investigation/InvestigationContext";

type SearchItem = {
	person: { key: string; label: string; count: number };
	searchLabel: string;
};

function normalizeQuery(input: string): string {
	return input.trim().toLowerCase();
}

export default function GeneralSearch() {
	const { people } = useInvestigation();
	const router = useRouter();
	const listboxId = "general-search-listbox";

	const rootRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const items = useMemo<SearchItem[]>(() => {
		return people.map((p) => ({
			person: p,
			searchLabel: normalizeQuery(p.label),
		}));
	}, [people]);

	const fuse = useMemo(() => {
		return new Fuse(items, {
			includeScore: true,
			threshold: 0.35,
			ignoreLocation: true,
			minMatchCharLength: 2,
			keys: [
				{ name: "person.label", weight: 0.75 },
				{ name: "searchLabel", weight: 0.2 },
				{ name: "person.key", weight: 0.05 },
			],
		});
	}, [items]);

	const results = useMemo(() => {
		const needle = normalizeQuery(query);
		if (!needle) return [] as SearchItem[];

		const hits = fuse.search(needle, { limit: 8 });
		return hits
			.sort((a, b) => (a.score ?? 1) - (b.score ?? 1) || b.item.person.count - a.item.person.count)
			.map((h) => h.item);
	}, [fuse, query]);

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

	const disabled = people.length === 0;
	const showDropdown = open && !disabled && results.length > 0;
	const activeOptionId = showDropdown
		? `general-search-option-${results[activeIndex]?.person.key ?? ""}`
		: undefined;

	function goToPerson(item: SearchItem) {
		setOpen(false);
		setQuery("");
		router.push(`/people/${encodeURIComponent(item.person.label)}`);
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
						if (!results.length) return;
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
							return;
						}
						if (e.key === "ArrowUp") {
							e.preventDefault();
							setActiveIndex((prev) => Math.max(prev - 1, 0));
							return;
						}
						if (e.key === "Enter") {
							e.preventDefault();
							const item = results[activeIndex];
							if (item) goToPerson(item);
						}
					}}
					placeholder={
						disabled ? "Load records to search people…" : "Search people…"
					}
					className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed dark:placeholder:text-zinc-400"
					aria-label="Search people"
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

			{open && !disabled && query && results.length === 0 ? (
				<div className="absolute z-20 mt-2 w-full rounded-md border border-zinc-200 bg-white p-2 text-sm text-zinc-600 shadow-sm dark:border-zinc-900 dark:bg-black dark:text-zinc-400">
					No matching people.
				</div>
			) : null}

			{showDropdown ? (
				<div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-black">
					<ul
						id={listboxId}
						role="listbox"
						className="divide-y divide-zinc-200 dark:divide-zinc-900"
					>
						{results.map((item, idx) => {
							const active = idx === activeIndex;
							const optionId = `general-search-option-${item.person.key}`;
							return (
								<li
									key={item.person.key}
									id={optionId}
									role="option"
									aria-selected={active}
								>
									<button
										type="button"
										onMouseEnter={() => setActiveIndex(idx)}
										onClick={() => goToPerson(item)}
										className={
											"flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm " +
											(active
												? "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
												: "bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950 dark:hover:text-zinc-50")
										}
									>
										<div className="min-w-0">
											<div className="truncate font-medium">
												{item.person.label}
											</div>
											<div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
												{item.person.key}
											</div>
										</div>

										<div className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
											{item.person.count} records
										</div>
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			) : null}
		</div>
	);
}
