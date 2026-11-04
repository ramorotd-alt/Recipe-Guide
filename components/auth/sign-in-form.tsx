"use client";

import { useActionState } from "react";

import { signIn } from "@/app/actions/auth";
import { buttonClassName, FieldError, fieldClassName, FormMessage } from "@/components/auth/fields";
import type { AuthFormState } from "@/lib/auth";

export function SignInForm({ nextPath, notice }: { nextPath: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    signIn,
    notice ? { message: notice } : undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />
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
          autoComplete="current-password"
          required
          className={fieldClassName}
        />
        <FieldError message={state?.fieldErrors?.password} />
      </div>
      <FormMessage message={state?.message} />
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
