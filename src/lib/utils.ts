import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeUrl(url?: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith(".")
  ) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed, "https://dummy.local");
    const protocol = parsed.protocol.toLowerCase();
    if (["http:", "https:", "mailto:", "tel:"].includes(protocol)) {
      return trimmed;
    }
  } catch {
    // If URL parsing fails, block potential javascript: or invalid protocols
  }
  return "about:blank";
}
