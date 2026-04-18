import { normalizePersonName } from "@/lib/investigation";

export type ChatParticipants = {
	a: { slug: string; label: string };
	b: { slug: string; label: string };
};

export type ChatThreadSummary = {
	id: string;
	participants: ChatParticipants;
	count: number;
	lastTimestampMs: number;
	lastTimestampText: string;
	lastContent: string | null;
};

export type MessageLikeEvent = {
	key: string;
	people: string[];
	timestampMs: number;
	timestampText: string;
	content: string | null;
};

function personSlugFromLabel(label: string): string {
	const normalized = normalizePersonName(label);
	return normalized
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "")
		.trim();
}

export function chatIdFromTwoPeople(aLabel: string, bLabel: string): {
	id: string;
	participants: ChatParticipants;
} | null {
	const aSlug = personSlugFromLabel(aLabel);
	const bSlug = personSlugFromLabel(bLabel);
	if (!aSlug || !bSlug) return null;
	if (aSlug === bSlug) return null;

	const first = aSlug < bSlug ? { slug: aSlug, label: aLabel } : { slug: bSlug, label: bLabel };
	const second = aSlug < bSlug ? { slug: bSlug, label: bLabel } : { slug: aSlug, label: aLabel };

	return {
		id: `${first.slug}-${second.slug}`,
		participants: { a: first, b: second },
	};
}

export function parseChatId(chatId: string): { a: string; b: string } | null {
	const parts = chatId.split("-");
	if (parts.length !== 2) return null;
	const [a, b] = parts;
	if (!a || !b || a === b) return null;
	return { a, b };
}

export function chatIdMatchesPeople(chatId: string, aLabel: string, bLabel: string): boolean {
	const built = chatIdFromTwoPeople(aLabel, bLabel);
	if (!built) return false;
	return built.id === chatId;
}

export function buildChatThreads(events: MessageLikeEvent[]): ChatThreadSummary[] {
	const threads = new Map<string, ChatThreadSummary>();

	for (const evt of events) {
		const sender = evt.people[0];
		const recipient = evt.people[1];
		if (!sender || !recipient) continue;

		const built = chatIdFromTwoPeople(sender, recipient);
		if (!built) continue;

		const existing = threads.get(built.id);
		if (existing) {
			existing.count += 1;
			continue;
		}

		threads.set(built.id, {
			id: built.id,
			participants: built.participants,
			count: 1,
			lastTimestampMs: evt.timestampMs,
			lastTimestampText: evt.timestampText,
			lastContent: evt.content,
		});
	}

	return Array.from(threads.values()).sort(
		(a, b) => b.lastTimestampMs - a.lastTimestampMs || a.id.localeCompare(b.id),
	);
}

export function filterChatEvents(
	events: MessageLikeEvent[],
	chatId: string,
): MessageLikeEvent[] {
	const parsed = parseChatId(chatId);
	if (!parsed) return [];

	return events.filter((evt) => {
		const sender = evt.people[0];
		const recipient = evt.people[1];
		if (!sender || !recipient) return false;
		return chatIdMatchesPeople(chatId, sender, recipient);
	});
}
