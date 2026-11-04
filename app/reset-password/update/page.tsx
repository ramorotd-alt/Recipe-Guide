import Link from "next/link";

import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata = {
  title: "Choose a new password · Recipe Guide",
};

export default function UpdatePasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Use at least 8 characters.</p>
      </div>
      <UpdatePasswordForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/reset-password" className="underline-offset-4 hover:underline">
          Request a new link
        </Link>
      </p>
    </main>
  );
}
