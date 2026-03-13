import { PrismaClient } from '@prisma/client'

declare global { var _prisma: PrismaClient | undefined }

export const prisma = global._prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') global._prisma = prisma
