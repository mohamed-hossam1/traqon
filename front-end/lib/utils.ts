import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  let message = "Something went wrong.";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  if (
    message.includes("SERVER ACTION") ||
    message.includes("WAS NOT FOUND ON THE SERVER") ||
    message.includes("FAILED-TO-FIND-SERVER-ACTION")
  ) {
    return "The application was updated. Please refresh the page and try again.";
  }

  return message;
}

export const getInitials = (user: { name?: string | null; email?: string | null }) => {
  const name = user.name?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const email = user.email?.trim();
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return "?";
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
