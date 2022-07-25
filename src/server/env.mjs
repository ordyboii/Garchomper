import { z } from "zod";

const envValidator = z.object({
  DATABASE_URL: z.string(),
  GOOGLE_ID: z.string(),
  GOOGLE_SECRET: z.string(),
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string()
});

const validateEnv = envValidator.safeParse(process.env);

if (!validateEnv.success) {
  throw new Error(
    Object.entries(validateEnv.error.flatten().fieldErrors).join(", ")
  );
}

export const env = validateEnv.data;
