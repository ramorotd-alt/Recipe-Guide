"use client";

import { deleteComment } from "@/app/actions/comments";

export function DeleteCommentButton({ recipeId, commentId }: { recipeId: string; commentId: string }) {
  return (
    <form action={deleteComment}>
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="commentId" value={commentId} />
      <button
        type="submit"
        className="text-sm font-medium text-red-700 underline-offset-4 hover:underline dark:text-red-400"
        onClick={(event) => {
          if (!window.confirm("Delete this comment?")) event.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
