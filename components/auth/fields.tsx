export const fieldClassName =
  "h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none focus-visible:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-visible:border-zinc-100";

export const buttonClassName =
  "h-11 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-700 dark:text-red-400">{message}</p>;
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="text-sm text-zinc-700 dark:text-zinc-300">
      {message}
    </p>
  );
}
