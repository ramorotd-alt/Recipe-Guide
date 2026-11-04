import { readText } from "@/lib/auth";

export const difficulties = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof difficulties)[number];

export type RecipeField =
  | "title"
  | "ingredients"
  | "instructions"
  | "cookingTime"
  | "difficulty"
  | "category";

export type RecipeFormState = {
  message?: string;
  fieldErrors?: Partial<Record<RecipeField, string>>;
};

export type RecipeInput = {
  title: string;
  ingredients: string;
  instructions: string;
  cookingTime: number;
  difficulty: Difficulty;
  category: string;
};

export function readRecipeForm(formData: FormData) {
  return {
    title: readText(formData, "title").trim(),
    ingredients: readText(formData, "ingredients").trim(),
    instructions: readText(formData, "instructions").trim(),
    cookingTime: readText(formData, "cookingTime").trim(),
    difficulty: readText(formData, "difficulty").trim(),
    category: readText(formData, "category").trim(),
  };
}

export function validateRecipe(input: ReturnType<typeof readRecipeForm>): {
  fieldErrors?: RecipeFormState["fieldErrors"];
  value?: RecipeInput;
} {
  const fieldErrors: NonNullable<RecipeFormState["fieldErrors"]> = {};

  if (input.title.length < 1 || input.title.length > 120) {
    fieldErrors.title = "Use 1 to 120 characters.";
  }
  if (input.ingredients.length < 1) {
    fieldErrors.ingredients = "Add the ingredients.";
  }
  if (input.instructions.length < 1) {
    fieldErrors.instructions = "Add the instructions.";
  }
  if (!/^[0-9]+$/.test(input.cookingTime)) {
    fieldErrors.cookingTime = "Enter a whole number of minutes.";
  } else {
    const cookingTime = Number(input.cookingTime);
    if (cookingTime < 1 || cookingTime > 1440) {
      fieldErrors.cookingTime = "Use 1 to 1440 minutes.";
    }
  }
  if (!difficulties.includes(input.difficulty as Difficulty)) {
    fieldErrors.difficulty = "Choose easy, medium, or hard.";
  }
  if (input.category.length < 1 || input.category.length > 40) {
    fieldErrors.category = "Use 1 to 40 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  return {
    value: {
      title: input.title,
      ingredients: input.ingredients,
      instructions: input.instructions,
      cookingTime: Number(input.cookingTime),
      difficulty: input.difficulty as Difficulty,
      category: input.category,
    },
  };
}
