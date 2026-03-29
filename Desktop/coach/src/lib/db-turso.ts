// Database client for Vercel + Turso deployment
// Use this file when deploying to Vercel with Turso database

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Usar Turso si las variables de entorno están configuradas
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    
    const adapter = new PrismaLibSql(libsql)
    
    return new PrismaClient({
      adapter,
      log: ['error'],
      errorFormat: 'pretty',
    })
  }
  
  // Fallback a SQLite local
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV === 'production') globalForPrisma.prisma = db
