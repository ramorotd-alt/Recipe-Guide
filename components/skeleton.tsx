import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

function LoadingState({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <p className="sr-only">{label}</p>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function FieldSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className={tall ? "h-28 w-full" : "h-11 w-full"} />
    </div>
  );
}

function RecipeCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-2 h-6 w-3/4" />
      <Skeleton className="mt-3 h-4 w-24" />
      <Skeleton className="mt-4 h-4 w-28" />
      <Skeleton className="mt-2 h-4 w-36" />
    </div>
  );
}

function RecipeCardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RecipeCardSkeleton />
      <RecipeCardSkeleton />
    </div>
  );
}

export function AccountMenuSkeleton() {
  return (
    <LoadingState label="Loading account">
      <Skeleton className="h-4 w-24" />
    </LoadingState>
  );
}

export function DashboardResultsSkeleton() {
  return (
    <LoadingState label="Loading recipes">
      <div className="flex max-w-3xl flex-col gap-4">
        <div className="flex max-w-xl flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <Skeleton className="h-6 w-36" />
        <RecipeCardGrid />
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <Skeleton className="h-6 w-64" />
        <RecipeCardGrid />
      </div>
    </LoadingState>
  );
}

export function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <div aria-hidden="true" className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>
      <DashboardResultsSkeleton />
    </main>
  );
}

export function ProfileFormSkeleton() {
  return (
    <LoadingState label="Loading profile">
      <div className="flex flex-col gap-4">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton tall />
        <Skeleton className="h-11 w-32" />
      </div>
    </LoadingState>
  );
}

export function SavedResultsSkeleton() {
  return (
    <LoadingState label="Loading saved recipes">
      <RecipeCardGrid />
    </LoadingState>
  );
}

export function SavedLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      <SavedResultsSkeleton />
    </main>
  );
}

export function ProfileLoading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-full" />
      </div>
      <ProfileFormSkeleton />
    </main>
  );
}

export function RecipeFormSkeleton() {
  return (
    <LoadingState label="Loading recipe">
      <div className="flex flex-col gap-4">
        <FieldSkeleton />
        <FieldSkeleton />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton tall />
        <FieldSkeleton tall />
        <Skeleton className="h-11 w-32" />
      </div>
    </LoadingState>
  );
}

export function RecipeEditorLoading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <RecipeFormSkeleton />
    </main>
  );
}

export function RecipeDetailLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <LoadingState label="Loading recipe">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mt-8 flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-11 w-32" />
        </div>
      </LoadingState>
    </main>
  );
}

export function SignInFormSkeleton() {
  return (
    <LoadingState label="Loading sign in">
      <div className="flex flex-col gap-4">
        <FieldSkeleton />
        <FieldSkeleton />
        <Skeleton className="h-11 w-24" />
      </div>
    </LoadingState>
  );
}

export function SignInLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-full" />
      </div>
      <SignInFormSkeleton />
    </main>
  );
}
