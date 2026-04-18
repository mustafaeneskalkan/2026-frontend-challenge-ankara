import Image from "next/image";

import { Badge } from "@/components/Investigation/Badge";
import { SectionTitle } from "@/components/Investigation/SectionTitle";

function personImageSrc(personKey: string): string {
  if (personKey === "podo") return "/n_podo_2.png";
  return "/blank-profile-500x500-ffffff-rectangle-user2-70png.png";
}

export function PersonCard(props: {
  personKey: string;
  name: string;
  description: string;
  count: number | null;
  latestTimestampText: string | null;
  latestLocation: string | null;
  sources: string[];
}) {
  const {
    personKey,
    name,
    description,
    count,
    latestTimestampText,
    latestLocation,
    sources,
  } = props;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-900 dark:bg-black">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-6">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950">
            <Image
              src={personImageSrc(personKey)}
              alt="Profile picture"
              fill
              sizes="144px"
              className="object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <SectionTitle>{name}</SectionTitle>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-900 dark:bg-zinc-950">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Summary
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-4">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Records
              </dt>
              <dd className="mt-1">
                {typeof count === "number" ? (
                  <Badge color="green">{count} records</Badge>
                ) : (
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">—</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Latest
              </dt>
              <dd className="mt-1">
                {latestTimestampText ? (
                  <Badge color="blue">{latestTimestampText}</Badge>
                ) : (
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">—</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Last seen
              </dt>
              <dd className="mt-1">
                {latestLocation ? (
                  <Badge>{latestLocation}</Badge>
                ) : (
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">—</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
