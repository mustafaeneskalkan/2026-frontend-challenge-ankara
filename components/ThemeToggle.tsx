"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "ankara-theme";

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.classList.toggle("light", theme === "light");
	root.style.colorScheme = theme;
}

function readInitialTheme(): Theme {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored === "light" || stored === "dark") return stored;
	} catch {
		// ignore
	}

	const prefersDark =
		typeof window !== "undefined" &&
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;

	return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("light");
	const [ready, setReady] = useState(false);
	const isDark = theme === "dark";

	useEffect(() => {
		try {
			const initial = readInitialTheme();
			applyTheme(initial);
			setTheme(initial);
		} finally {
			setReady(true);
		}
	}, []);

	return (
		<button
			type="button"
			disabled={!ready}
			aria-pressed={isDark}
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			title={isDark ? "Switch to light" : "Switch to dark"}
			className={
				"inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 " +
				"hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 " +
				"dark:border-zinc-900 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950 dark:hover:text-zinc-50"
			}
			onClick={() => {
				const next: Theme = isDark ? "light" : "dark";
				setTheme(next);
				applyTheme(next);
				try {
					localStorage.setItem(THEME_STORAGE_KEY, next);
				} catch {
					// ignore
				}
			}}
		>
			<span className="sr-only">{isDark ? "Dark theme" : "Light theme"}</span>
			{isDark ? (
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M21 12.6A8.5 8.5 0 1 1 11.4 3a6.5 6.5 0 1 0 9.6 9.6Z" />
				</svg>
			) : (
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2" />
					<path d="M12 20v2" />
					<path d="M4.93 4.93l1.41 1.41" />
					<path d="M17.66 17.66l1.41 1.41" />
					<path d="M2 12h2" />
					<path d="M20 12h2" />
					<path d="M4.93 19.07l1.41-1.41" />
					<path d="M17.66 6.34l1.41-1.41" />
				</svg>
			)}
		</button>
	);
}
