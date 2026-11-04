import { headers } from "next/headers";

export type AuthFormState = {
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  if (value.includes("://")) return fallback;
  return value;
}

export async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function validateEmail(email: string): string | undefined {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) {
    return "Use at least 8 characters.";
  }
  return undefined;
}
