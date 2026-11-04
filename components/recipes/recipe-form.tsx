"use client";

import { useActionState } from "react";

import { createRecipe } from "@/app/actions/recipes";
import {
  buttonClassName,
  FieldError,
  fieldClassName,
  FormMessage,
} from "@/components/auth/fields";
import type { RecipeFormState } from "@/lib/recipe";

const textareaClassName =
  "min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus-visible:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-visible:border-zinc-100";

export function RecipeForm() {
  const [state, action, pending] = useActionState<RecipeFormState | undefined, FormData>(
    createRecipe,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input id="title" name="title" required maxLength={120} className={fieldClassName} />
        <FieldError message={state?.fieldErrors?.title} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <input id="category" name="category" required maxLength={40} className={fieldClassName} />
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
            className={fieldClassName}
          />
          <FieldError message={state?.fieldErrors?.cookingTime} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty
          </label>
          <select id="difficulty" name="difficulty" required defaultValue="easy" className={fieldClassName}>
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
        <textarea id="ingredients" name="ingredients" required rows={4} className={textareaClassName} />
        <FieldError message={state?.fieldErrors?.ingredients} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="instructions" className="text-sm font-medium">
          Instructions
        </label>
        <textarea id="instructions" name="instructions" required rows={6} className={textareaClassName} />
        <FieldError message={state?.fieldErrors?.instructions} />
      </div>
      <FormMessage message={state?.message} />
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Sharing…" : "Share recipe"}
      </button>
    </form>
  );
}
