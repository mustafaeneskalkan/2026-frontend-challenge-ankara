"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { SectionTitle } from "@/components/Investigation/SectionTitle";
import { useInvestigation } from "@/components/Investigation/InvestigationContext";
import { buildChatThreads, filterChatEvents, parseChatId } from "@/lib/chats";

export default function ChatPage() {
	const params = useParams<{ chat?: string | string[] }>();
	const chatIdRaw = params?.chat;
	const chatId = Array.isArray(chatIdRaw) ? chatIdRaw[0] : chatIdRaw;

	const { events } = useInvestigation();

	const messageEvents = useMemo(
		() => events.filter((evt) => evt.source === "messages"),
		[events],
	);

	const chatEvents = useMemo(() => {
		if (!chatId) return [];
		return filterChatEvents(messageEvents, chatId);
	}, [messageEvents, chatId]);

	const chronological = useMemo(() => {
		return [...chatEvents].sort((a, b) => a.timestampMs - b.timestampMs);
	}, [chatEvents]);

	const participants = useMemo(() => {
		if (!chatId) return null;
		const parsed = parseChatId(chatId);
		if (!parsed) return null;

		const thread = buildChatThreads(chatEvents)[0];
		if (thread) return thread.participants;

		return {
			a: { slug: parsed.a, label: parsed.a },
			b: { slug: parsed.b, label: parsed.b },
		};
	}, [chatEvents, chatId]);

	if (!chatId || !participants) {
		return (
			<div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
				<main className="mx-auto w-full max-w-4xl flex-1 px-6 py-4">
					<section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
						<div className="flex items-center justify-between gap-3">
							<SectionTitle>Chat</SectionTitle>
							<Link
								href="/messages"
								className="text-sm text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-300 dark:decoration-zinc-700 dark:hover:decoration-zinc-500"
							>
								Back to chats
							</Link>
						</div>
						<p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
							Invalid chat.
						</p>
					</section>
				</main>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
			<main className="mx-auto w-full max-w-4xl flex-1 px-6 py-4">
				<section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-black">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="min-w-0">
							<SectionTitle>Chat</SectionTitle>
							<div className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">
								<Link
									href={`/people/${encodeURIComponent(participants.a.label)}`}
									className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:text-zinc-50 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
								>
									{participants.a.label}
								</Link>
								<span className="mx-1">↔</span>
								<Link
									href={`/people/${encodeURIComponent(participants.b.label)}`}
									className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:text-zinc-50 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
								>
									{participants.b.label}
								</Link>
							</div>
						</div>

						<Link
							href="/messages"
							className="text-sm text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-300 dark:decoration-zinc-700 dark:hover:decoration-zinc-500"
						>
							Back to chats
						</Link>
					</div>

					<div className="mt-4 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-900">
						<ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
							{chronological.length ? (
								chronological.map((evt) => {
									const sender = evt.people[0] ?? "Unknown";
									const alignRight =
										evt.people[0] &&
										evt.people[1] &&
										evt.people[0] === participants.b.label;

									return (
										<li key={evt.key} className="px-3 py-3">
											<div className={"flex " + (alignRight ? "justify-end" : "justify-start")}> 
												<div className="max-w-[80%] rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-900 dark:bg-black">
													<div className="flex items-baseline justify-between gap-3">
														<div className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
															{sender === "Unknown" ? (
																sender
															) : (
																<Link
																	href={`/people/${encodeURIComponent(sender)}`}
																	className="underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
																>
																	{sender}
																</Link>
															)}
														</div>
														<div className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
															{evt.timestampText || "—"}
														</div>
													</div>
													{evt.content ? (
														<p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
															{evt.content}
														</p>
													) : (
														<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
															No content.
														</p>
													)}
												</div>
											</div>
										</li>
									);
								})
							) : (
								<li className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
									No messages found for this chat.
								</li>
							)}
						</ul>
					</div>
				</section>
			</main>
		</div>
	);
}
