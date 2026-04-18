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
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === "light" || stored === "dark") return stored;

	const prefersDark =
		typeof window !== "undefined" &&
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;

	return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("light");
	const [ready, setReady] = useState(false);

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
			aria-pressed={theme === "dark"}
			aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
			title={theme === "dark" ? "Switch to light" : "Switch to dark"}
			className={
				"inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 " +
				"hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 " +
				"dark:border-zinc-900 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950 dark:hover:text-zinc-50"
			}
			onClick={() => {
				const next: Theme = theme === "dark" ? "light" : "dark";
				setTheme(next);
				applyTheme(next);
				localStorage.setItem(THEME_STORAGE_KEY, next);
			}}
		>
			{theme === "dark" ? "Dark" : "Light"}
		</button>
	);
}
