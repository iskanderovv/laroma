import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { BACKEND_URL } from "./api/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fullUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

