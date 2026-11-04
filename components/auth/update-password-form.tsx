"use client";

import { useActionState } from "react";

import { updatePassword } from "@/app/actions/auth";
import { buttonClassName, FieldError, fieldClassName, FormMessage } from "@/components/auth/fields";
import type { AuthFormState } from "@/lib/auth";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    updatePassword,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
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
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
