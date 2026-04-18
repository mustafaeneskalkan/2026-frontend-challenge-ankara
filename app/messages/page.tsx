"use client";

import { useMemo } from "react";
import Link from "next/link";

import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";
import { buildChatThreads } from "@/lib/chats";

export default function MessagesPage() {
	const { events } = useInvestigation();

	const messageEvents = useMemo(
		() => events.filter((evt) => evt.source === "messages"),
		[events],
	);

	const threads = useMemo(
		() => buildChatThreads(messageEvents),
		[messageEvents],
	);

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-4">
				<section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
					<div className="flex items-center justify-between gap-3">
						<SectionTitle>Chats</SectionTitle>
						<span className="text-xs text-zinc-600 dark:text-zinc-400">
							{threads.length} chats
						</span>
					</div>

					<div className="mt-3 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-900">
						<ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
							{threads.length ? (
								threads.map((thread) => (
									<li key={thread.id}>
										<Link
											href={`/messages/${thread.id}`}
											className={
												"block px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 " +
												"focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
											}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
														<span>{thread.participants.a.label}</span>
														<span className="mx-1 text-zinc-500 dark:text-zinc-400">
															↔
														</span>
														<span>{thread.participants.b.label}</span>
													</div>
													{thread.lastContent ? (
														<p className="mt-0.5 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
															{thread.lastContent}
														</p>
													) : (
														<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
															No message content.
														</p>
													)}
												</div>

												<div className="shrink-0 text-right">
													<div className="text-xs text-zinc-500 dark:text-zinc-400">
														{thread.lastTimestampText || "—"}
													</div>
													<div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
														{thread.count} messages
													</div>
												</div>
											</div>
										</Link>
									</li>
								))
							) : (
								<li className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
									No chats found in loaded records.
								</li>
							)}
						</ul>
					</div>
				</section>
			</main>
		</div>
	);
}
