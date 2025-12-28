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
const PORT = process.env.PORT || 3001

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
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // name 컬럼이 없으면 추가 (기존 테이블 마이그레이션)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`
    } catch (e) {
      // 컬럼이 이미 존재하면 무시
    }
    
    // profile_image_url 컬럼이 없으면 추가
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT`
    } catch (e) {}
    
    // join_date 컬럼이 없으면 추가
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date DATE`
    } catch (e) {}

    // contacts 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // contacts 테이블에 project_id 컬럼 추가 (기존 테이블 마이그레이션)
    try {
      await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL`
    } catch (e) {}

    // projects 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        image TEXT,
        memo TEXT,
        is_visible BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'planned',
        project_key VARCHAR(50) DEFAULT 'APP',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // projects 테이블에 project_key 컬럼 추가 (기존 테이블 마이그레이션)
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_key VARCHAR(50) DEFAULT 'APP'`
    } catch (e) {}
    
    // is_featured 컬럼이 없으면 추가 (기존 테이블 마이그레이션)
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`
    } catch (e) {
      // 컬럼이 이미 존재하면 무시
    }
    
    // start_date, end_date 컬럼이 없으면 추가
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE`
    } catch (e) {}
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE`
    } catch (e) {}
    
    // media 컬럼 추가 (JSON 배열로 이미지/비디오 URL 저장)
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb`
    } catch (e) {}

    // tasks 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        task_key VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'backlog',
        priority VARCHAR(50) DEFAULT 'medium',
        assignee_id INTEGER REFERENCES users(id),
        assignee_name VARCHAR(255),
        project_id INTEGER REFERENCES projects(id),
        project_key VARCHAR(50) DEFAULT 'APP',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // project_id 컬럼이 없으면 추가
    try {
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id)`
    } catch (e) {}
    
    // start_date, end_date 컬럼이 없으면 추가
    try {
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE`
    } catch (e) {}
    try {
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_date DATE`
    } catch (e) {}

    // portfolio_items 테이블 생성 (랜딩페이지 포트폴리오 항목)
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // finances 테이블 생성 (재무 관리)
    await sql`
      CREATE TABLE IF NOT EXISTS finances (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(15, 2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        payment_method VARCHAR(50),
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // finances 테이블에 project_id 컬럼 추가 (기존 테이블 마이그레이션)
    try {
      await sql`ALTER TABLE finances ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL`
    } catch (e) {}

    // events 테이블 생성 (캘린더 일정)
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        color VARCHAR(50) DEFAULT 'blue',
        is_private BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // events 테이블에 is_private 컬럼 추가 (기존 테이블 마이그레이션)
    try {
      await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false`
    } catch (e) {}

    // event_invitations 테이블 생성 (일정 초대)
    await sql`
      CREATE TABLE IF NOT EXISTS event_invitations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      )
    `

    // announcements 테이블 생성 (공지사항)
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // 초기 관리자 계정이 없으면 생성
    const existingAdmin = await sql`
      SELECT * FROM users WHERE email = ${'studio.realday@gmail.com'}
    `
    
    let adminId = null
    if (existingAdmin.length === 0) {
      const adminResult = await sql`
        INSERT INTO users (email, password, role)
        VALUES (${'studio.realday@gmail.com'}, ${'admin0714'}, ${'ceo'})
        RETURNING id
      `
      adminId = adminResult[0].id
      console.log('초기 관리자 계정이 생성되었습니다.')
    } else {
      adminId = existingAdmin[0].id
    }

    // 더미 프로젝트 데이터 추가 (정확히 8개 보장)
    const existingProjects = await sql`SELECT COUNT(*) as count FROM projects`
    const currentCount = parseInt(existingProjects[0].count) || 0
    
    // 8개 미만이면 기존 프로젝트 삭제 후 더미 프로젝트 추가
    if (currentCount < 8) {
      // 기존 프로젝트가 있으면 모두 삭제하고 새로 추가
      if (currentCount > 0) {
        await sql`DELETE FROM projects`
      }
      
      const dummyProjects = [
        {
          title: 'LE SSERAFIM Brand Identity',
          description: 'LE SSERAFIM is a K-pop girl group produced by Source Music. Brand identity design that expresses fearless confidence and authentic self-expression.',
          category: 'Brand Identity',
          image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'BRAND'
        },
        {
          title: 'Modern Web Platform',
          description: 'A cutting-edge web platform designed for seamless user experience. Clean interface with intuitive navigation and responsive design.',
          category: 'Web Design',
          image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'WEB'
        },
        {
          title: 'Creative Studio Portfolio',
          description: 'Portfolio website showcasing creative works and design projects. Minimalist design with focus on visual storytelling.',
          category: 'Portfolio',
          image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'PORT'
        },
        {
          title: 'Mobile App Interface',
          description: 'User-friendly mobile application interface design. Modern UI/UX with smooth interactions and engaging visual elements.',
          category: 'Mobile Design',
          image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'MOBILE'
        },
        {
          title: 'LE SSERAFIM Brand Identity',
          description: 'LE SSERAFIM is a K-pop girl group produced by Source Music. Brand identity design that expresses fearless confidence and authentic self-expression.',
          category: 'Brand Identity',
          image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'BRAND'
        },
        {
          title: 'Modern Web Platform',
          description: 'A cutting-edge web platform designed for seamless user experience. Clean interface with intuitive navigation and responsive design.',
          category: 'Web Design',
          image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'WEB'
        },
        {
          title: 'Creative Studio Portfolio',
          description: 'Portfolio website showcasing creative works and design projects. Minimalist design with focus on visual storytelling.',
          category: 'Portfolio',
          image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'PORT'
        },
        {
          title: 'Mobile App Interface',
          description: 'User-friendly mobile application interface design. Modern UI/UX with smooth interactions and engaging visual elements.',
          category: 'Mobile Design',
          image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
          is_visible: true,
          is_featured: true,
          status: 'completed',
          project_key: 'MOBILE'
        }
      ]

      for (const project of dummyProjects) {
        try {
          await sql`
            INSERT INTO projects (title, description, category, image, is_visible, is_featured, status, project_key)
            VALUES (${project.title}, ${project.description}, ${project.category}, ${project.image}, ${project.is_visible}, ${project.is_featured}, ${project.status}, ${project.project_key})
          `
        } catch (e) {
          console.error('더미 프로젝트 추가 실패:', e)
        }
      }
      console.log(`${dummyProjects.length}개의 더미 프로젝트가 추가되었습니다.`)
    }

    console.log('데이터베이스 초기화 완료')
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error)
  }
}

// 서버 시작 시 DB 초기화
initDatabase()

// Admin 로그인 API
app.post('/api/admin-login', async (req, res) => {
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

// 멤버 목록 조회 (관리자용)
app.get('/api/members', async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, password, role, name, profile_image_url, join_date, created_at
      FROM users
      ORDER BY created_at DESC
    `
    
    res.json({
      success: true,
      members: users
    })
  } catch (error) {
    console.error('Members fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 멤버 추가 (관리자용)
app.post('/api/members', async (req, res) => {
  try {
    const { email, password, role, name, profileImageUrl, joinDate } = req.body

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 비밀번호를 입력해주세요.' 
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

    // 중복 이메일 확인
    const existing = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '이미 존재하는 이메일입니다.' 
      })
    }

    // 멤버 추가
    const result = await sql`
      INSERT INTO users (email, password, role, name, profile_image_url, join_date)
      VALUES (${email}, ${password}, ${role || 'pro'}, ${name || null}, ${profileImageUrl || null}, ${joinDate || null})
      RETURNING id, email, role, name, profile_image_url, join_date, created_at
    `

    res.json({
      success: true,
      message: '멤버가 추가되었습니다.',
      member: result[0]
    })

  } catch (error) {
    console.error('Member add error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 멤버 수정 (관리자용)
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { password, role, name, profileImageUrl, joinDate } = req.body

    // 기존 사용자 확인
    const existing = await sql`
      SELECT * FROM users WHERE id = ${id}
    `
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '멤버를 찾을 수 없습니다.' 
      })
    }

    // 업데이트할 필드만 업데이트
    if (password) {
      await sql`
        UPDATE users SET password = ${password} WHERE id = ${id}
      `
    }
    if (role) {
      await sql`
        UPDATE users SET role = ${role} WHERE id = ${id}
      `
    }
    if (name !== undefined) {
      await sql`
        UPDATE users SET name = ${name} WHERE id = ${id}
      `
    }
    if (profileImageUrl !== undefined) {
      await sql`
        UPDATE users SET profile_image_url = ${profileImageUrl || null} WHERE id = ${id}
      `
    }
    if (joinDate !== undefined) {
      await sql`
        UPDATE users SET join_date = ${joinDate || null} WHERE id = ${id}
      `
    }

    // 업데이트된 사용자 정보 조회
    const result = await sql`
      SELECT id, email, role, name, profile_image_url, join_date, created_at FROM users WHERE id = ${id}
    `

    res.json({
      success: true,
      message: '멤버 정보가 수정되었습니다.',
      member: result[0]
    })

  } catch (error) {
    console.error('Member update error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 멤버 삭제 (관리자용)
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 최고관리자 계정은 삭제 불가
    const user = await sql`
      SELECT email FROM users WHERE id = ${id}
    `
    
    if (user.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '멤버를 찾을 수 없습니다.' 
      })
    }

    if (user[0].email === 'studio.realday@gmail.com') {
      return res.status(400).json({ 
        success: false, 
        message: '최고관리자 계정은 삭제할 수 없습니다.' 
      })
    }

    await sql`
      DELETE FROM users WHERE id = ${id}
    `

    res.json({
      success: true,
      message: '멤버가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Member delete error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 프로젝트 목록 조회
app.get('/api/projects', async (req, res) => {
  try {
    const { visible, featured } = req.query
    let projects
    
    if (featured === 'true') {
      // 랜딩페이지용: featured 프로젝트만
      projects = await sql`
        SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
        FROM projects
        WHERE is_featured = true AND is_visible = true
        ORDER BY created_at DESC
      `
    } else if (visible === 'true') {
      // Projects 페이지용: 노출된 프로젝트만
      projects = await sql`
        SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
        FROM projects
        WHERE is_visible = true
        ORDER BY created_at DESC
      `
    } else {
      // 관리자용: 모든 프로젝트
      projects = await sql`
        SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, COALESCE(media, '[]'::jsonb) as media, created_at, updated_at
        FROM projects
        ORDER BY created_at DESC
      `
    }
    
    res.json({
      success: true,
      projects
    })
  } catch (error) {
    console.error('Projects fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 프로젝트 추가
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, category, image, memo, isVisible, isFeatured, status, projectKey, startDate, endDate, media } = req.body

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: '프로젝트 제목을 입력해주세요.' 
      })
    }

    let mediaJson = '[]'
    try {
      mediaJson = media ? JSON.stringify(media) : '[]'
    } catch (e) {
      console.error('Media JSON 변환 실패:', e)
    }

    // media 컬럼이 없을 수 있으므로 안전하게 처리
    let result
    try {
      result = await sql`
        INSERT INTO projects (title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, media)
        VALUES (${title}, ${description || null}, ${category || null}, ${image || null}, ${memo || null}, ${isVisible !== false}, ${isFeatured === true}, ${status || 'planned'}, ${projectKey || 'APP'}, ${startDate || null}, ${endDate || null}, ${mediaJson}::jsonb)
        RETURNING *
      `
    } catch (e) {
      // media 컬럼이 없으면 media 없이 INSERT
      if (e.message && e.message.includes('media')) {
        result = await sql`
          INSERT INTO projects (title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date)
          VALUES (${title}, ${description || null}, ${category || null}, ${image || null}, ${memo || null}, ${isVisible !== false}, ${isFeatured === true}, ${status || 'planned'}, ${projectKey || 'APP'}, ${startDate || null}, ${endDate || null})
          RETURNING *
        `
      } else {
        throw e
      }
    }

    res.json({
      success: true,
      message: '프로젝트가 추가되었습니다.',
      project: result[0]
    })

  } catch (error) {
    console.error('Project add error:', error)
    console.error('Error details:', error.message, error.stack)
    res.status(500).json({ 
      success: false, 
      message: error.message || '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// 프로젝트 수정
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, category, image, memo, isVisible, isFeatured, status, projectKey, startDate, endDate, media } = req.body

    const existing = await sql`
      SELECT * FROM projects WHERE id = ${id}
    `
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '프로젝트를 찾을 수 없습니다.' 
      })
    }

    // 업데이트
    if (title) {
      await sql`UPDATE projects SET title = ${title} WHERE id = ${id}`
    }
    if (description !== undefined) {
      await sql`UPDATE projects SET description = ${description} WHERE id = ${id}`
    }
    if (category !== undefined) {
      await sql`UPDATE projects SET category = ${category} WHERE id = ${id}`
    }
    if (image !== undefined) {
      await sql`UPDATE projects SET image = ${image} WHERE id = ${id}`
    }
    if (memo !== undefined) {
      await sql`UPDATE projects SET memo = ${memo} WHERE id = ${id}`
    }
    if (isVisible !== undefined) {
      await sql`UPDATE projects SET is_visible = ${isVisible} WHERE id = ${id}`
    }
    if (isFeatured !== undefined) {
      await sql`UPDATE projects SET is_featured = ${isFeatured} WHERE id = ${id}`
    }
    if (status !== undefined) {
      await sql`UPDATE projects SET status = ${status} WHERE id = ${id}`
    }
    if (projectKey !== undefined) {
      await sql`UPDATE projects SET project_key = ${projectKey || 'APP'} WHERE id = ${id}`
    }
    if (media !== undefined) {
      try {
        const mediaJson = media ? JSON.stringify(media) : '[]'
        await sql`UPDATE projects SET media = ${mediaJson}::jsonb WHERE id = ${id}`
      } catch (e) {
        // media 컬럼이 없으면 무시
        if (e.message && e.message.includes('media')) {
          console.warn('media 컬럼이 없어 업데이트를 건너뜁니다.')
        } else {
          throw e
        }
      }
    }
    
    await sql`UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`

    const result = await sql`
      SELECT * FROM projects WHERE id = ${id}
    `

    res.json({
      success: true,
      message: '프로젝트가 수정되었습니다.',
      project: result[0]
    })

  } catch (error) {
    console.error('Project update error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 프로젝트 삭제
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params

    const project = await sql`
      SELECT * FROM projects WHERE id = ${id}
    `
    
    if (project.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '프로젝트를 찾을 수 없습니다.' 
      })
    }

    await sql`DELETE FROM projects WHERE id = ${id}`

    res.json({
      success: true,
      message: '프로젝트가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Project delete error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// Task Key 생성 함수 (예: APP-1, APP-2)
async function generateTaskKey(projectKey = 'APP') {
  const result = await sql`
    SELECT task_key FROM tasks 
    WHERE task_key LIKE ${projectKey + '-%'}
    ORDER BY task_key DESC
    LIMIT 1
  `
  
  if (result.length === 0) {
    return `${projectKey}-1`
  }
  
  const lastKey = result[0].task_key
  const parts = lastKey.split('-')
  if (parts.length === 2) {
    const lastNumber = parseInt(parts[1]) || 0
    return `${projectKey}-${lastNumber + 1}`
  }
  
  return `${projectKey}-1`
}

// 업무 목록 조회
app.get('/api/tasks', async (req, res) => {
  try {
    const { projectId } = req.query
    let tasks
    
    if (projectId) {
      tasks = await sql`
        SELECT t.*, u.name as assignee_name, u.email as assignee_email
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE t.project_id = ${parseInt(projectId)}
        ORDER BY t.created_at DESC
      `
    } else {
      tasks = await sql`
        SELECT t.*, u.name as assignee_name, u.email as assignee_email
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        ORDER BY t.created_at DESC
      `
    }
    
    res.json({
      success: true,
      tasks
    })
  } catch (error) {
    console.error('Tasks fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 업무 추가
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, assigneeName, projectKey, projectId, startDate, endDate, assigneeIds, assigneeNames } = req.body
    
    // 다중 담당자 지원: assigneeNames가 있으면 첫 번째 담당자 사용
    const finalAssigneeId = assigneeIds && assigneeIds.length > 0 ? assigneeIds[0] : assigneeId
    const finalAssigneeName = assigneeNames && assigneeNames.length > 0 ? assigneeNames[0] : assigneeName

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: '업무 제목을 입력해주세요.' 
      })
    }

    const taskKey = await generateTaskKey(projectKey || 'APP')

    const result = await sql`
      INSERT INTO tasks (task_key, title, description, status, priority, assignee_id, assignee_name, project_id, project_key, start_date, end_date)
      VALUES (${taskKey}, ${title}, ${description || null}, ${status || 'backlog'}, ${priority || 'medium'}, ${finalAssigneeId || null}, ${finalAssigneeName || null}, ${projectId || null}, ${projectKey || 'APP'}, ${startDate || null}, ${endDate || null})
      RETURNING *
    `

    res.json({
      success: true,
      message: '업무가 추가되었습니다.',
      task: result[0]
    })

  } catch (error) {
    console.error('Task add error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 업무 수정
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, priority, assigneeId, assigneeName, projectId, startDate, endDate, assigneeIds, assigneeNames } = req.body
    
    // 다중 담당자 지원: assigneeNames가 있으면 첫 번째 담당자 사용
    const finalAssigneeId = assigneeIds && assigneeIds.length > 0 ? assigneeIds[0] : assigneeId
    const finalAssigneeName = assigneeNames && assigneeNames.length > 0 ? assigneeNames[0] : assigneeName

    const existing = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '업무를 찾을 수 없습니다.' 
      })
    }

    // 업데이트할 필드만 업데이트
    if (title) {
      await sql`UPDATE tasks SET title = ${title} WHERE id = ${id}`
    }
    if (description !== undefined) {
      await sql`UPDATE tasks SET description = ${description} WHERE id = ${id}`
    }
    if (status !== undefined) {
      await sql`UPDATE tasks SET status = ${status} WHERE id = ${id}`
    }
    if (priority !== undefined) {
      await sql`UPDATE tasks SET priority = ${priority} WHERE id = ${id}`
    }
    if (finalAssigneeId !== undefined) {
      await sql`UPDATE tasks SET assignee_id = ${finalAssigneeId || null} WHERE id = ${id}`
    }
    if (finalAssigneeName !== undefined) {
      await sql`UPDATE tasks SET assignee_name = ${finalAssigneeName || null} WHERE id = ${id}`
    }
    if (projectId !== undefined) {
      await sql`UPDATE tasks SET project_id = ${projectId || null} WHERE id = ${id}`
    }
    if (startDate !== undefined) {
      await sql`UPDATE tasks SET start_date = ${startDate || null} WHERE id = ${id}`
    }
    if (endDate !== undefined) {
      await sql`UPDATE tasks SET end_date = ${endDate || null} WHERE id = ${id}`
    }
    
    await sql`UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`

    const result = await sql`
      SELECT t.*, u.name as assignee_name, u.email as assignee_email
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ${id}
    `

    res.json({
      success: true,
      message: '업무가 수정되었습니다.',
      task: result[0]
    })

  } catch (error) {
    console.error('Task update error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 업무 삭제
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params

    const task = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `
    
    if (task.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '업무를 찾을 수 없습니다.' 
      })
    }

    await sql`DELETE FROM tasks WHERE id = ${id}`

    res.json({
      success: true,
      message: '업무가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Task delete error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 포트폴리오 항목 목록 조회
app.get('/api/portfolio-items', async (req, res) => {
  try {
    const items = await sql`
      SELECT id, number, title, description, display_order, created_at, updated_at
      FROM portfolio_items
      ORDER BY display_order ASC, number ASC
    `
    
    res.json({
      success: true,
      items
    })
  } catch (error) {
    console.error('Portfolio items fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 포트폴리오 항목 추가
app.post('/api/portfolio-items', async (req, res) => {
  try {
    const { number, title, description, displayOrder } = req.body

    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 설명을 입력해주세요.' 
      })
    }

    const result = await sql`
      INSERT INTO portfolio_items (number, title, description, display_order)
      VALUES (${number || null}, ${title}, ${description}, ${displayOrder || 0})
      RETURNING *
    `

    res.json({
      success: true,
      message: '포트폴리오 항목이 추가되었습니다.',
      item: result[0]
    })

  } catch (error) {
    console.error('Portfolio item add error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 포트폴리오 항목 수정
app.put('/api/portfolio-items/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { number, title, description, displayOrder } = req.body

    const existing = await sql`
      SELECT * FROM portfolio_items WHERE id = ${id}
    `
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '포트폴리오 항목을 찾을 수 없습니다.' 
      })
    }

    if (number !== undefined) {
      await sql`UPDATE portfolio_items SET number = ${number} WHERE id = ${id}`
    }
    if (title) {
      await sql`UPDATE portfolio_items SET title = ${title} WHERE id = ${id}`
    }
    if (description !== undefined) {
      await sql`UPDATE portfolio_items SET description = ${description} WHERE id = ${id}`
    }
    if (displayOrder !== undefined) {
      await sql`UPDATE portfolio_items SET display_order = ${displayOrder} WHERE id = ${id}`
    }
    
    await sql`UPDATE portfolio_items SET updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`

    const result = await sql`
      SELECT * FROM portfolio_items WHERE id = ${id}
    `

    res.json({
      success: true,
      message: '포트폴리오 항목이 수정되었습니다.',
      item: result[0]
    })

  } catch (error) {
    console.error('Portfolio item update error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 포트폴리오 항목 삭제
app.delete('/api/portfolio-items/:id', async (req, res) => {
  try {
    const { id } = req.params

    const item = await sql`
      SELECT * FROM portfolio_items WHERE id = ${id}
    `
    
    if (item.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '포트폴리오 항목을 찾을 수 없습니다.' 
      })
    }

    await sql`DELETE FROM portfolio_items WHERE id = ${id}`

    res.json({
      success: true,
      message: '포트폴리오 항목이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Portfolio item delete error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 재무 내역 목록 조회
app.get('/api/finances', async (req, res) => {
  try {
    const { projectId } = req.query
    let finances
    if (projectId) {
      finances = await sql`
        SELECT id, date, category, description, amount, type, payment_method, project_id, created_at, updated_at
        FROM finances
        WHERE project_id = ${projectId}
        ORDER BY date DESC, created_at DESC
      `
    } else {
      finances = await sql`
        SELECT id, date, category, description, amount, type, payment_method, project_id, created_at, updated_at
        FROM finances
        ORDER BY date DESC, created_at DESC
      `
    }
    
    res.json({
      success: true,
      finances: finances.map(f => ({
        ...f,
        amount: parseFloat(f.amount)
      }))
    })
  } catch (error) {
    console.error('Finances fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 재무 내역 추가
app.post('/api/finances', async (req, res) => {
  try {
    const { date, category, description, amount, type, paymentMethod, projectId } = req.body

    if (!date || !category || !amount || !type) {
      return res.status(400).json({ 
        success: false, 
        message: '날짜, 카테고리, 금액, 유형을 모두 입력해주세요.' 
      })
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ 
        success: false, 
        message: '유형은 income 또는 expense여야 합니다.' 
      })
    }

    const result = await sql`
      INSERT INTO finances (date, category, description, amount, type, payment_method, project_id)
      VALUES (${date}, ${category}, ${description || null}, ${amount}, ${type}, ${paymentMethod || null}, ${projectId || null})
      RETURNING *
    `

    res.json({
      success: true,
      message: '재무 내역이 추가되었습니다.',
      finance: {
        ...result[0],
        amount: parseFloat(result[0].amount)
      }
    })

  } catch (error) {
    console.error('Finance add error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 재무 내역 수정
app.put('/api/finances/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { date, category, description, amount, type, paymentMethod, projectId } = req.body

    if (!date || !category || !amount || !type) {
      return res.status(400).json({ 
        success: false, 
        message: '날짜, 카테고리, 금액, 유형을 모두 입력해주세요.' 
      })
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ 
        success: false, 
        message: '유형은 income 또는 expense여야 합니다.' 
      })
    }

    const result = await sql`
      UPDATE finances
      SET date = ${date},
          category = ${category},
          description = ${description || null},
          amount = ${amount},
          type = ${type},
          payment_method = ${paymentMethod || null},
          project_id = ${projectId || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '재무 내역을 찾을 수 없습니다.' 
      })
    }

    res.json({
      success: true,
      message: '재무 내역이 수정되었습니다.',
      finance: {
        ...result[0],
        amount: parseFloat(result[0].amount)
      }
    })

  } catch (error) {
    console.error('Finance update error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 재무 내역 삭제
app.delete('/api/finances/:id', async (req, res) => {
  try {
    const { id } = req.params

    const finance = await sql`
      SELECT * FROM finances WHERE id = ${id}
    `
    
    if (finance.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '재무 내역을 찾을 수 없습니다.' 
      })
    }

    await sql`DELETE FROM finances WHERE id = ${id}`

    res.json({
      success: true,
      message: '재무 내역이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Finance delete error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// ========== 캘린더 일정 API ==========

// 일정 조회 (초대 정보 포함)
app.get('/api/events', async (req, res) => {
  try {
    const events = await sql`
      SELECT 
        e.*,
        u.name as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC, e.start_time ASC
    `
    
    // 각 일정의 초대 정보 가져오기
    const eventsWithInvitations = await Promise.all(events.map(async (evt) => {
      const invitations = await sql`
        SELECT 
          ei.*,
          u.name as user_name,
          u.email as user_email
        FROM event_invitations ei
        LEFT JOIN users u ON ei.user_id = u.id
        WHERE ei.event_id = ${evt.id}
      `
      return {
        ...evt,
        invitations: invitations
      }
    }))
    
    res.json(eventsWithInvitations)
  } catch (error) {
    console.error('Events fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 일정 추가
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, start_time, end_time, color, is_private, invited_user_ids } = req.body

    if (!title || !date) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 날짜는 필수입니다.' 
      })
    }

    // 인증된 사용자 정보 가져오기 (간단한 예시)
    const userId = req.user?.id || null

    const result = await sql`
      INSERT INTO events (title, description, date, start_time, end_time, color, is_private, created_by)
      VALUES (${title}, ${description || null}, ${date}, ${start_time || null}, ${end_time || null}, ${color || 'blue'}, ${is_private || false}, ${userId})
      RETURNING *
    `
    
    const eventId = result[0].id
    
    // 초대할 사용자 추가
    if (invited_user_ids && Array.isArray(invited_user_ids) && invited_user_ids.length > 0) {
      for (const invitedUserId of invited_user_ids) {
        if (invitedUserId !== userId) { // 자기 자신은 제외
          try {
            await sql`
              INSERT INTO event_invitations (event_id, user_id, status)
              VALUES (${eventId}, ${invitedUserId}, 'pending')
              ON CONFLICT (event_id, user_id) DO NOTHING
            `
          } catch (e) {
            console.error('초대 추가 실패:', e)
          }
        }
      }
    }

    res.json({
      success: true,
      message: '일정이 추가되었습니다.',
      event: result[0]
    })

  } catch (error) {
    console.error('Event add error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 일정 수정
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, date, start_time, end_time, color, is_private, invited_user_ids } = req.body

    if (!title || !date) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 날짜는 필수입니다.' 
      })
    }

    const result = await sql`
      UPDATE events
      SET 
        title = ${title},
        description = ${description || null},
        date = ${date},
        start_time = ${start_time || null},
        end_time = ${end_time || null},
        color = ${color || 'blue'},
        is_private = ${is_private !== undefined ? is_private : false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    
    // 초대할 사용자 업데이트 (새로 추가만, 기존 초대는 유지)
    if (invited_user_ids && Array.isArray(invited_user_ids)) {
      const existingInvitations = await sql`
        SELECT user_id FROM event_invitations WHERE event_id = ${id}
      `
      const existingUserIds = existingInvitations.map(i => i.user_id)
      
      for (const invitedUserId of invited_user_ids) {
        if (!existingUserIds.includes(invitedUserId)) {
          try {
            await sql`
              INSERT INTO event_invitations (event_id, user_id, status)
              VALUES (${id}, ${invitedUserId}, 'pending')
              ON CONFLICT (event_id, user_id) DO NOTHING
            `
          } catch (e) {
            console.error('초대 추가 실패:', e)
          }
        }
      }
    }

    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '일정을 찾을 수 없습니다.' 
      })
    }

    res.json({
      success: true,
      message: '일정이 수정되었습니다.',
      event: result[0]
    })

  } catch (error) {
    console.error('Event update error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 일정 삭제
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params

    const event = await sql`
      SELECT * FROM events WHERE id = ${id}
    `
    
    if (event.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '일정을 찾을 수 없습니다.' 
      })
    }

    await sql`DELETE FROM events WHERE id = ${id}`

    res.json({
      success: true,
      message: '일정이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Event delete error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// ========== 공지사항 API ==========

// 공지사항 조회
app.get('/api/announcements', async (req, res) => {
  try {
    // Authorization 헤더에서 사용자 정보 가져오기
    const authHeader = req.headers.authorization
    let user = null
    let isSuperAdmin = false
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      // 토큰에서 사용자 이메일 추출 (간단한 예시, 실제로는 JWT 디코딩)
      // 여기서는 localStorage의 user 정보를 사용하므로, 다른 방법 필요
      // 일단 모든 공지사항 반환하도록 수정
    }
    
    // 슈퍼어드민은 모든 공지사항 조회, 일반 사용자는 활성 공지사항만 조회
    const announcements = await sql`
      SELECT 
        a.*,
        u.name as created_by_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.is_active = true
      ORDER BY a.created_at DESC
    `
    res.json(announcements)
  } catch (error) {
    console.error('Announcements fetch error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 공지사항 추가 (슈퍼어드민만)
app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, is_active } = req.body

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 내용은 필수입니다.' 
      })
    }

    // Authorization 헤더에서 사용자 정보 가져오기
    const authHeader = req.headers.authorization
    let userId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 실제로는 JWT 토큰을 디코딩해야 하지만, 여기서는 간단하게 처리
      // 클라이언트에서 user 정보를 함께 보내도록 하거나, 
      // 토큰에서 사용자 정보를 추출해야 함
      // 일단 created_by는 null로 설정 (나중에 수정 가능)
    }

    // is_active 값 처리 (undefined일 경우 true로 설정)
    const activeStatus = is_active !== undefined ? is_active : true

    // 기존 활성 공지사항 비활성화 (하나만 활성화되도록)
    if (activeStatus === true) {
      await sql`UPDATE announcements SET is_active = false WHERE is_active = true`
    }

    const result = await sql`
      INSERT INTO announcements (title, content, is_active, created_by)
      VALUES (${title}, ${content}, ${activeStatus}, ${userId})
      RETURNING *
    `

    res.json({
      success: true,
      message: '공지사항이 추가되었습니다.',
      announcement: result[0]
    })

  } catch (error) {
    console.error('Announcement add error:', error)
    console.error('Error details:', error.message, error.stack)
    res.status(500).json({ 
      success: false, 
      message: error.message || '서버 오류가 발생했습니다.' 
    })
  }
})

// 공지사항 수정 (슈퍼어드민만)
app.put('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, is_active } = req.body

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 내용은 필수입니다.' 
      })
    }

    // 활성화할 경우 기존 활성 공지사항 비활성화
    if (is_active === true) {
      await sql`UPDATE announcements SET is_active = false WHERE is_active = true AND id != ${id}`
    }

    const result = await sql`
      UPDATE announcements
      SET 
        title = ${title},
        content = ${content},
        is_active = ${is_active !== false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '공지사항을 찾을 수 없습니다.' 
      })
    }

    res.json({
      success: true,
      message: '공지사항이 수정되었습니다.',
      announcement: result[0]
    })

  } catch (error) {
    console.error('Announcement update error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// 공지사항 삭제 (슈퍼어드민만)
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params

    const announcement = await sql`
      SELECT * FROM announcements WHERE id = ${id}
    `
    
    if (announcement.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '공지사항을 찾을 수 없습니다.' 
      })
    }

    await sql`DELETE FROM announcements WHERE id = ${id}`

    res.json({
      success: true,
      message: '공지사항이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Announcement delete error:', error)
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    })
  }
})

// ========== 일정 초대 API ==========

// 초대 수락/거절
app.put('/api/events/:eventId/invitations/:action', async (req, res) => {
  try {
    const { eventId, action } = req.params
    
    if (action !== 'accept' && action !== 'decline') {
      return res.status(400).json({ 
        success: false, 
        message: '액션은 accept 또는 decline이어야 합니다.' 
      })
    }

    const userId = req.user?.id || null
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: '인증이 필요합니다.' 
      })
    }

    const status = action === 'accept' ? 'accepted' : 'declined'

    const result = await sql`
      UPDATE event_invitations
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE event_id = ${eventId} AND user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '초대를 찾을 수 없습니다.' 
      })
    }

    res.json({
      success: true,
      message: `초대가 ${action === 'accept' ? '수락' : '거절'}되었습니다.`,
      invitation: result[0]
    })

  } catch (error) {
    console.error('Invitation update error:', error)
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

