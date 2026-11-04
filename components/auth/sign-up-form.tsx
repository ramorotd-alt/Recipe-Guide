"use client";

import { useActionState } from "react";

import { signUp } from "@/app/actions/auth";
import { buttonClassName, FieldError, fieldClassName, FormMessage } from "@/components/auth/fields";
import type { AuthFormState } from "@/lib/auth";

export function SignUpForm() {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    signUp,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClassName}
        />
        <FieldError message={state?.fieldErrors?.email} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={fieldClassName}
        />
        <FieldError message={state?.fieldErrors?.password} />
      </div>
      <FormMessage message={state?.message} />
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
