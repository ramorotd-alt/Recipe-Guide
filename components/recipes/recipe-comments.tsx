import Link from "next/link";

import { CommentCard } from "@/components/recipes/comment-card";
import { CommentForm } from "@/components/recipes/comment-form";

export type RecipeComment = {
  id: string;
  author: string;
  when: string;
  edited: boolean;
  body: string;
  isOwner: boolean;
};

export function RecipeComments({
  recipeId,
  signedIn,
  signInHref,
  error,
  comments,
}: {
  recipeId: string;
  signedIn: boolean;
  signInHref: string;
  error: boolean;
  comments: RecipeComment[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Comments</h2>
      {signedIn ? (
        <CommentForm recipeId={recipeId} />
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href={signInHref} className="font-medium underline-offset-4 hover:underline">
            Sign in to comment
          </Link>
        </p>
      )}
      {error ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Comments could not be loaded.</p>
      ) : comments.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No comments yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              recipeId={recipeId}
              commentId={comment.id}
              author={comment.author}
              when={comment.when}
              edited={comment.edited}
              body={comment.body}
              isOwner={comment.isOwner}
            />
          ))}
        </div>
      )}
    </section>
  );
}
