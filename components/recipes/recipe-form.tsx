"use client";

import { useActionState } from "react";

import { createRecipe, updateRecipe } from "@/app/actions/recipes";
import {
  buttonClassName,
  FieldError,
  fieldClassName,
  FormMessage,
} from "@/components/auth/fields";
import type { RecipeFormState, RecipeInput } from "@/lib/recipe";

const textareaClassName =
  "min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus-visible:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-visible:border-zinc-100";

export function RecipeForm({
  mode,
  recipeId,
  initial,
  submitLabel,
  pendingLabel,
}: {
  mode: "create" | "edit";
  recipeId?: string;
  initial?: RecipeInput;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState<RecipeFormState | undefined, FormData>(
    mode === "edit" ? updateRecipe : createRecipe,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {recipeId ? <input type="hidden" name="id" value={recipeId} /> : null}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={initial?.title}
          className={fieldClassName}
        />
        <FieldError message={state?.fieldErrors?.title} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          maxLength={40}
          defaultValue={initial?.category}
          className={fieldClassName}
        />
        <FieldError message={state?.fieldErrors?.category} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="cookingTime" className="text-sm font-medium">
            Cooking time (minutes)
          </label>
          <input
            id="cookingTime"
            name="cookingTime"
            type="number"
            min={1}
            max={1440}
            required
            defaultValue={initial?.cookingTime}
            className={fieldClassName}
          />
          <FieldError message={state?.fieldErrors?.cookingTime} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            required
            defaultValue={initial?.difficulty ?? "easy"}
            className={fieldClassName}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <FieldError message={state?.fieldErrors?.difficulty} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="ingredients" className="text-sm font-medium">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          name="ingredients"
          required
          rows={4}
          defaultValue={initial?.ingredients}
          className={textareaClassName}
        />
        <FieldError message={state?.fieldErrors?.ingredients} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="instructions" className="text-sm font-medium">
          Instructions
        </label>
        <textarea
          id="instructions"
          name="instructions"
          required
          rows={6}
          defaultValue={initial?.instructions}
          className={textareaClassName}
        />
        <FieldError message={state?.fieldErrors?.instructions} />
      </div>
      <FormMessage message={state?.message} />
      <button type="submit" disabled={pending} className={`${buttonClassName} w-fit`}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
