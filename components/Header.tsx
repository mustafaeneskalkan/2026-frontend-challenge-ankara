"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export default function Header(props: {
	title: ReactNode;
	search: ReactNode;
	statistics: ReactNode;
}) {
	const { title, search, statistics } = props;

	return (
		<header className="border-b border-zinc-200 bg-white dark:border-zinc-900 dark:bg-black">
			<div className="flex w-full items-center justify-between gap-4 px-6 py-4">
				<Link href="/" aria-label="Go to home page" className="block min-w-0 shrink-0">
					{title}
				</Link>
				<div className="min-w-0 flex-1">{search}</div>
				<div className="shrink-0">{statistics}</div>
			</div>
		</header>
	);
}
