export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-900 dark:bg-black">
        <div className="h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
          <div className="h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
          <div className="h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
