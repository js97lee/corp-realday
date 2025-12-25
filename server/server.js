import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env 파일 로드 (현재 디렉토리 기준)
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5001

// 미들웨어
app.use(cors())
app.use(express.json())

// DATABASE_URL 확인
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL이 설정되지 않았습니다.')
  console.error('   .env 파일에 DATABASE_URL을 설정해주세요.')
  process.exit(1)
}

// Neon DB 연결
const sql = neon(databaseUrl)

// 데이터베이스 초기화 (테이블 생성)
async function initDatabase() {
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

// 서버 시작 시 DB 초기화
initDatabase()

// Admin 로그인 API
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 비밀번호를 모두 입력해주세요.' 
      })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: '올바른 이메일 형식을 입력해주세요.' 
      })
    }

    // 데이터베이스에서 사용자 조회
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      })
    }

    const user = users[0]

    // 비밀번호 확인 (실제로는 bcrypt.compare 사용)
    // 여기서는 간단하게 체크 (실제로는 해시된 비밀번호 비교)
    if (password !== user.password) {
      return res.status(401).json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      })
    }

    // 로그인 성공
    res.json({
      success: true,
      message: '로그인 성공',
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'employee' // super_admin, manager, employee
      },
      token: 'mock-jwt-token' // 실제로는 JWT 토큰 생성
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// Contact 폼 제출 API
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body

    // 입력 검증
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: '모든 필드를 입력해주세요.' 
      })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: '올바른 이메일 형식을 입력해주세요.' 
      })
    }

    // 데이터베이스에 Contact 저장
    const result = await sql`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
      RETURNING *
    `

    const contact = result[0]

    // 성공 응답
    res.json({
      success: true,
      message: '메시지가 전송되었습니다!',
      contact
    })

  } catch (error) {
    console.error('Contact error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// Contact 목록 조회 (관리자용)
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await sql`
      SELECT * FROM contacts
      ORDER BY created_at DESC
    `
    
    res.json({
      success: true,
      contacts
    })
  } catch (error) {
    console.error('Contacts fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`http://localhost:${PORT}`)
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}가 이미 사용 중입니다.`)
    console.error('다른 포트를 사용하거나 기존 프로세스를 종료하세요.')
  } else {
    console.error('서버 시작 오류:', err)
  }
  process.exit(1)
})

