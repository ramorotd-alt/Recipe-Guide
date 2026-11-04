import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset password · Recipe Guide",
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter your email and we will send a link to choose a new password.
        </p>
      </div>
      <ResetPasswordForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/sign-in" className="underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
