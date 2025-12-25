// 공통 DB 연결 유틸리티
import { neon } from '@neondatabase/serverless'

// Netlify 환경 변수에서 DATABASE_URL 가져오기
// Netlify Neon 확장에서 자동으로 제공되는 환경 변수 사용
const databaseUrl = process.env.DATABASE_URL || 
                     process.env.NETLIFY_DATABASE_URL ||
                     process.env.POSTGRES_PRISMA_URL ||
                     process.env.POSTGRES_URL_NON_POOLING

if (!databaseUrl) {
  console.error('❌ DATABASE_URL이 설정되지 않았습니다.')
  console.error('사용 가능한 환경 변수:', Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('NEON')
  ))
  throw new Error('DATABASE_URL이 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.')
}

console.log('✅ DATABASE_URL 확인됨:', databaseUrl.substring(0, 30) + '...')

// Neon DB 연결
export const sql = neon(databaseUrl)

// 데이터베이스 초기화 (테이블 생성)
export async function initDatabase() {
  try {
    // users 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // contacts 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 초기 관리자 계정이 없으면 생성
    const existingAdmin = await sql`
      SELECT * FROM users WHERE email = ${'studio.realday@gmail.com'}
    `
    
    if (existingAdmin.length === 0) {
      await sql`
        INSERT INTO users (email, password, role)
        VALUES (${'studio.realday@gmail.com'}, ${'admin0714'}, ${'super_admin'})
      `
      console.log('초기 관리자 계정이 생성되었습니다.')
    }

    console.log('데이터베이스 초기화 완료')
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error)
  }
}

