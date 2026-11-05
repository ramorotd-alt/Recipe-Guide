import Link from "next/link";

import { toggleLike } from "@/app/actions/likes";
import { likeLabel } from "@/lib/social-text";

export function RecipeLikes({
  recipeId,
  count,
  liked,
  signedIn,
  signInHref,
  error,
}: {
  recipeId: string;
  count: number;
  liked: boolean;
  signedIn: boolean;
  signInHref: string;
  error: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Likes</h2>
      {error ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Likes could not be loaded.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {signedIn ? (
            <form action={toggleLike}>
              <input type="hidden" name="recipeId" value={recipeId} />
              <button
                type="submit"
                aria-pressed={liked}
                className={`inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium ${
                  liked
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                }`}
              >
                <Heart filled={liked} />
                {liked ? "Liked" : "Like"}
              </button>
            </form>
          ) : (
            <Link
              href={signInHref}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <Heart filled={false} />
              Sign in to like
            </Link>
          )}
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{likeLabel(count)}</p>
        </div>
      )}
    </section>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"
      />
    </svg>
  );
}
