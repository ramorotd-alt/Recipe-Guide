import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
      <section className="flex max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Share a recipe</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create an account to start adding recipes, or sign in if you already have one.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Start creating
          </Link>
          <Link href="/sign-in" className="text-sm font-medium underline-offset-4 hover:underline">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
