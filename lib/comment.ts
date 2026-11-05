import { readText } from "@/lib/auth";

export { commentLabel, likeLabel } from "@/lib/social-text";

export type CommentFormState = {
  message?: string;
  fieldErrors?: { body?: string };
};

export function readCommentBody(formData: FormData) {
  return readText(formData, "body").trim();
}

export function validateCommentBody(body: string): CommentFormState["fieldErrors"] | undefined {
  if (body.length < 1 || body.length > 1000) {
    return { body: "Use 1 to 1000 characters." };
  }
  return undefined;
}

export function commentWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function commentWasEdited(createdAt: string, updatedAt: string) {
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}

