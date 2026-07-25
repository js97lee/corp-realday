import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12
const SESSION_TTL_HOURS = 24

export function isPasswordHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value)
}

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) {
    return false
  }

  if (isPasswordHash(storedPassword)) {
    return bcrypt.compare(password, storedPassword)
  }

  return password === storedPassword
}

export async function upgradeLegacyPassword(sql, user, password) {
  if (isPasswordHash(user.password)) {
    return
  }

  const passwordHash = await hashPassword(password)
  await sql`
    UPDATE users
    SET password = ${passwordHash}
    WHERE id = ${user.id}
  `
}

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(sql, userId) {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashSessionToken(token)

  await sql`DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP`
  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (
      ${tokenHash},
      ${userId},
      CURRENT_TIMESTAMP + (${SESSION_TTL_HOURS} * INTERVAL '1 hour')
    )
  `

  return token
}

export async function getSessionUser(sql, token) {
  if (!token) {
    return null
  }

  const tokenHash = hashSessionToken(token)
  const users = await sql`
    SELECT u.id, u.email, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > CURRENT_TIMESTAMP
    LIMIT 1
  `

  return users[0] || null
}
