"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/app/actions/auth";
import { buttonClassName, FieldError, fieldClassName, FormMessage } from "@/components/auth/fields";
import type { AuthFormState } from "@/lib/auth";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    requestPasswordReset,
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
      <FormMessage message={state?.message} />
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
