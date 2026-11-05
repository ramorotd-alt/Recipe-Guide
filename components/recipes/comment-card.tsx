"use client";

import { useState } from "react";

import { DeleteCommentButton } from "@/components/recipes/delete-comment-button";
import { EditCommentForm } from "@/components/recipes/comment-form";

export function CommentCard({
  recipeId,
  commentId,
  author,
  when,
  edited,
  body,
  isOwner,
}: {
  recipeId: string;
  commentId: string;
  author: string;
  when: string;
  edited: boolean;
  body: string;
  isOwner: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditCommentForm
        recipeId={recipeId}
        commentId={commentId}
        body={body}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium">
        {author}
        <span className="font-normal text-zinc-500">
          {when ? ` · ${when}` : ""}
          {edited ? " · edited" : ""}
        </span>
      </p>
      <p className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{body}</p>
      {isOwner ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Edit
          </button>
          <DeleteCommentButton recipeId={recipeId} commentId={commentId} />
        </div>
      ) : null}
    </article>
  );
}
