"use client";

export default function ErrorPage(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { error, reset } = props;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-900 dark:bg-black">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {error.message}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-950"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
