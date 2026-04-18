"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
	href: string;
	label: string;
};

const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Dashboard" },
    { href: "/events", label: "Events" },
    { href: "/people", label: "People" }
];

export default function Navbar() {
	const pathname = usePathname();

	return (
		<aside className="sticky top-0 flex h-full w-64 shrink-0 flex-col border-r border-zinc-200 bg-white text-zinc-900 dark:border-zinc-900 dark:bg-black dark:text-zinc-50">
			<nav aria-label="Primary" className="flex-1 px-2 py-3">
				<ul className="space-y-1">
					{NAV_ITEMS.map((item) => {
						const active = pathname === item.href;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									aria-current={active ? "page" : undefined}
									className={
										"block rounded-md px-3 py-2 text-sm font-medium " +
										(active
											? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
											: "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-950 dark:hover:text-zinc-50")
									}
								>
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
		</aside>
	);
}
