import { z } from "zod";

const PasswordRule = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long." })
  .max(100, { message: "Password cannot exceed 100 characters." });

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(100, { message: "Name cannot exceed 100 characters." })
    .optional(),
  avatarUrl: z
    .string()
    .url({ message: "Please provide a valid URL for avatar." })
    .max(2048)
    .optional()
    .nullable(),
});

export const ChangePasswordSchema = z.object({
  oldPassword: PasswordRule,
  newPassword: PasswordRule,
  revokeOtherSessions: z.boolean().optional(),
});

export const SetPasswordSchema = z.object({
  password: PasswordRule,
  revokeOtherSessions: z.boolean().optional(),
});

export const RevokeSessionSchema = z.object({
  sessionId: z.string().uuid({ message: "Invalid session ID format." }),
});

