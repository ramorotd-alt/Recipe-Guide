"use client";

import { deleteRecipe } from "@/app/actions/recipes";

export function DeleteRecipeButton({ id }: { id: string }) {
  return (
    <form action={deleteRecipe}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-medium text-red-700 underline-offset-4 hover:underline dark:text-red-400"
        onClick={(event) => {
          if (!window.confirm("Delete this recipe?")) event.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
