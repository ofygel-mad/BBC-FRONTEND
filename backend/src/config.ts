import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL:  z.string().min(1),
  JWT_SECRET:    z.string().min(32),
  PORT:          z.coerce.number().default(4000),
  FRONTEND_URL:  z.string().url().default('http://localhost:3000'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data
