import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be less than 72 characters" })
  .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Include at least one number" });

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Enter a valid email address" })
  .max(255, { message: "Email is too long" });

export function validatePassword(value: string): string | null {
  const res = passwordSchema.safeParse(value);
  return res.success ? null : res.error.issues[0].message;
}

export function validateEmail(value: string): string | null {
  const res = emailSchema.safeParse(value);
  return res.success ? null : res.error.issues[0].message;
}

export function passwordStrength(value: string): { score: number; label: string } {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const labels = ["Very weak", "Weak", "Okay", "Good", "Strong", "Very strong"];
  return { score, label: labels[score] };
}
