"use client";

import { useActionState } from "react";

import { createComment, updateComment } from "@/app/actions/comments";
import { buttonClassName, FieldError, FormMessage } from "@/components/auth/fields";
import type { CommentFormState } from "@/lib/comment";

const textareaClassName =
  "min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus-visible:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-visible:border-zinc-100";

export function CommentForm({ recipeId }: { recipeId: string }) {
  const [state, action, pending] = useActionState<CommentFormState | undefined, FormData>(
    createComment,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="recipeId" value={recipeId} />
      <div className="flex flex-col gap-2">
        <label htmlFor="comment-body" className="text-sm font-medium">
          Comment
        </label>
        <textarea
          id="comment-body"
          name="body"
          required
          rows={4}
          maxLength={1000}
          className={textareaClassName}
        />
        <FieldError message={state?.fieldErrors?.body} />
      </div>
      <FormMessage message={state?.message} />
      <button type="submit" disabled={pending} className={`${buttonClassName} w-fit`}>
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}

export function EditCommentForm({
  recipeId,
  commentId,
  body,
  onCancel,
}: {
  recipeId: string;
  commentId: string;
  body: string;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState<CommentFormState | undefined, FormData>(
    updateComment,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="commentId" value={commentId} />
      <div className="flex flex-col gap-2">
        <label htmlFor={`comment-body-${commentId}`} className="text-sm font-medium">
          Comment
        </label>
        <textarea
          id={`comment-body-${commentId}`}
          name="body"
          required
          rows={4}
          maxLength={1000}
          defaultValue={body}
          className={textareaClassName}
        />
        <FieldError message={state?.fieldErrors?.body} />
      </div>
      <FormMessage message={state?.message} />
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={`${buttonClassName} w-fit`}>
          {pending ? "Saving…" : "Save comment"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
