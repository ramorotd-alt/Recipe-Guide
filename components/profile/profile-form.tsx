"use client";

import { useActionState } from "react";

import { updateProfile } from "@/app/actions/profile";
import {
  buttonClassName,
  FieldError,
  fieldClassName,
  FormMessage,
} from "@/components/auth/fields";
import type { ProfileDetails, ProfileFormState } from "@/lib/profile";

const textareaClassName =
  "min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus-visible:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-visible:border-zinc-100";

export function ProfileForm({ email, profile }: { email: string; profile: ProfileDetails }) {
  const [state, action, pending] = useActionState<ProfileFormState | undefined, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Email</span>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{email}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          maxLength={80}
          defaultValue={profile.fullName}
          className={fieldClassName}
        />
        <FieldError message={state?.fieldErrors?.fullName} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="userName" className="text-sm font-medium">
          Username
        </label>
        <input
          id="userName"
          name="userName"
          required
          minLength={2}
          maxLength={30}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={profile.userName}
          className={fieldClassName}
        />
        <p className="text-sm text-zinc-500">Letters, numbers, and underscores.</p>
        <FieldError message={state?.fieldErrors?.userName} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={profile.bio}
          className={textareaClassName}
        />
        <p className="text-sm text-zinc-500">Optional. Up to 500 characters.</p>
        <FieldError message={state?.fieldErrors?.bio} />
      </div>
      <FormMessage message={state?.message} />
      <button type="submit" disabled={pending} className={`${buttonClassName} w-fit`}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
