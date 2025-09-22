import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const extractYear = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.getFullYear();
};
