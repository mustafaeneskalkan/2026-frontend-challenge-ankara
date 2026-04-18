import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-900 dark:bg-black">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">404</p>
        <h1 className="mt-1 text-lg font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-950"
          >
            Go to dashboard
          </Link>
          <Link
            href="/people"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-950"
          >
            Browse people
          </Link>
        </div>
      </div>
    </div>
  );
}
