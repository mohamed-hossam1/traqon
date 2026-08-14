import { z } from "zod";

const PasswordRule = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long." })
  .max(100, { message: "Password cannot exceed 100 characters." });

const EmailRule = z
  .string()
  .min(1, { message: "Email is required." })
  .email({ message: "Please provide a valid email address." })
  .transform((value) => value.trim().toLowerCase());

export const LoginSchema = z.object({
  email: EmailRule,
  password: PasswordRule,
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(100, { message: "Name cannot exceed 100 characters." })
    .optional(),
  email: EmailRule,
  password: PasswordRule,
});

export const ForgotPasswordSchema = z.object({
  email: EmailRule,
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Verification token is required." }),
});

export const ResendVerificationEmailSchema = z.object({
  email: EmailRule,
});
