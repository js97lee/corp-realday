// 공통 DB 연결 유틸리티
import { neon } from '@neondatabase/serverless'

// DATABASE_URL 가져오기 함수 (런타임에 호출)
function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL ||
                       process.env.POSTGRES_PRISMA_URL ||
                       process.env.POSTGRES_URL_NON_POOLING

  if (!databaseUrl) {
    const availableEnvKeys = Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('NEON')
    )
    console.error('❌ DATABASE_URL이 설정되지 않았습니다.')
    console.error('사용 가능한 환경 변수:', availableEnvKeys)
    throw new Error('DATABASE_URL이 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.')
  }

  console.log('✅ DATABASE_URL 확인됨:', databaseUrl.substring(0, 30) + '...')
  return databaseUrl
}

// Neon DB 연결 (지연 초기화)
let sqlInstance = null

export function getSql() {
  if (!sqlInstance) {
    const databaseUrl = getDatabaseUrl()
    sqlInstance = neon(databaseUrl)
  }
  return sqlInstance
}

// 데이터베이스 초기화 (테이블 생성)
export async function initDatabase() {
  try {
    let sqlFunc
    try {
      sqlFunc = getSql()
    } catch (sqlError) {
      console.error('Failed to get SQL connection:', sqlError)
      throw new Error(`데이터베이스 연결 실패: ${sqlError.message}`)
    }
    
    // users 테이블 생성
    await sqlFunc`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'employee',
        name VARCHAR(255),
        profile_image_url TEXT,
        join_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // name 컬럼이 없으면 추가 (기존 테이블 마이그레이션)
    try {
      await sqlFunc`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`
    } catch (e) {
      // 컬럼이 이미 존재하면 무시
    }
    
    // profile_image_url 컬럼이 없으면 추가
    try {
      await sqlFunc`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT`
    } catch (e) {}
    
    // join_date 컬럼이 없으면 추가
    try {
      await sqlFunc`ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date DATE`
    } catch (e) {}

    // contacts 테이블 생성
    await sqlFunc`
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
      await sqlFunc`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL`
    } catch (e) {}

    // projects 테이블 생성
    await sqlFunc`
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
      await sqlFunc`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_key VARCHAR(50) DEFAULT 'APP'`
    } catch (e) {}
    
    // is_featured 컬럼이 없으면 추가 (기존 테이블 마이그레이션)
    try {
      await sqlFunc`ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`
    } catch (e) {
      // 컬럼이 이미 존재하면 무시
    }
    
    // start_date, end_date 컬럼이 없으면 추가
    try {
      await sqlFunc`ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE`
    } catch (e) {}
    try {
      await sqlFunc`ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE`
    } catch (e) {}
    
    // media 컬럼 추가 (JSON 배열로 이미지/비디오 URL 저장)
    try {
      await sqlFunc`ALTER TABLE projects ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb`
    } catch (e) {
      // 컬럼이 이미 존재하거나 다른 이유로 실패할 수 있음
      console.warn('Media column migration warning:', e.message)
    }

    // tasks 테이블 생성
    await sqlFunc`
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
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // project_id 컬럼이 없으면 추가
    try {
      await sqlFunc`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id)`
    } catch (e) {}
    
    // start_date, end_date 컬럼이 없으면 추가
    try {
      await sqlFunc`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE`
    } catch (e) {}
    try {
      await sqlFunc`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_date DATE`
    } catch (e) {}
    
    // is_deleted, deleted_at 컬럼이 없으면 추가 (soft delete)
    try {
      await sqlFunc`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`
    } catch (e) {}
    try {
      await sqlFunc`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`
    } catch (e) {}

    // portfolio_items 테이블 생성 (랜딩페이지 포트폴리오 항목)
    await sqlFunc`
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
    await sqlFunc`
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
      await sqlFunc`ALTER TABLE finances ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL`
    } catch (e) {}

    // events 테이블 생성 (캘린더 일정)
    await sqlFunc`
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
      await sqlFunc`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false`
    } catch (e) {}

    // event_invitations 테이블 생성 (일정 초대)
    await sqlFunc`
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
    await sqlFunc`
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
    const existingAdmin = await sqlFunc`
      SELECT * FROM users WHERE email = ${'studio.realday@gmail.com'}
    `
    
    let adminId = null
    if (existingAdmin.length === 0) {
      const adminResult = await sqlFunc`
        INSERT INTO users (email, password, role)
        VALUES (${'studio.realday@gmail.com'}, ${'admin0714'}, ${'ceo'})
        RETURNING id
      `
      adminId = adminResult[0].id
      console.log('초기 관리자 계정이 생성되었습니다.')
    } else {
      adminId = existingAdmin[0].id
    }

    // 더미 프로젝트 데이터 추가 (프로젝트가 없을 때만)
    const existingProjects = await sqlFunc`SELECT COUNT(*) as count FROM projects`
    if (existingProjects[0].count === 0) {
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
        }
      ]

      for (const project of dummyProjects) {
        try {
          await sqlFunc`
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
    throw error
  }
}

