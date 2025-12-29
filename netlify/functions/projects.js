import { getSql, initDatabase } from './db.js'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    // 데이터베이스 초기화 (모든 요청에서)
    await initDatabase()
    const sqlFunc = getSql()

    // GET: 프로젝트 목록 조회
    if (event.httpMethod === 'GET') {
      try {
        const { visible, featured } = event.queryStringParameters || {}
        let projects

        // media 컬럼 존재 여부 확인
        let hasMediaColumn = false
        try {
          const columnCheck = await sqlFunc`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'media'
          `
          hasMediaColumn = columnCheck.length > 0
        } catch (e) {
          console.warn('Media 컬럼 확인 실패:', e)
          hasMediaColumn = false
        }

        if (featured === 'true') {
          // 랜딩페이지용: featured 프로젝트만
          if (hasMediaColumn) {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
              FROM projects
              WHERE is_featured = true AND is_visible = true
              ORDER BY created_at DESC
            `
          } else {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, created_at
              FROM projects
              WHERE is_featured = true AND is_visible = true
              ORDER BY created_at DESC
            `
            // media 필드 추가 (빈 배열)
            projects = projects.map(p => ({ ...p, media: [] }))
          }
        } else if (visible === 'true') {
          // Projects 페이지용: 노출된 프로젝트만
          if (hasMediaColumn) {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
              FROM projects
              WHERE is_visible = true
              ORDER BY created_at DESC
            `
          } else {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, created_at
              FROM projects
              WHERE is_visible = true
              ORDER BY created_at DESC
            `
            // media 필드 추가 (빈 배열)
            projects = projects.map(p => ({ ...p, media: [] }))
          }
        } else {
          // 관리자용: 모든 프로젝트
          if (hasMediaColumn) {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, COALESCE(media, '[]'::jsonb) as media, created_at, updated_at
              FROM projects
              ORDER BY created_at DESC
            `
          } else {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
              FROM projects
              ORDER BY created_at DESC
            `
            // media 필드 추가 (빈 배열)
            projects = projects.map(p => ({ ...p, media: [] }))
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            projects
          }),
        }
      } catch (dbError) {
        // 테이블이 없으면 초기화 후 재시도
        if (dbError.message && dbError.message.includes('does not exist')) {
          await initDatabase()
          const { visible, featured } = event.queryStringParameters || {}
          let projects

          // media 컬럼 존재 여부 확인
          let hasMediaColumn = false
          try {
            const columnCheck = await sqlFunc`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'projects' AND column_name = 'media'
            `
            hasMediaColumn = columnCheck.length > 0
          } catch (e) {
            hasMediaColumn = false
          }

          if (featured === 'true') {
            if (hasMediaColumn) {
              projects = await sqlFunc`
                SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                FROM projects
                WHERE is_featured = true AND is_visible = true
                ORDER BY created_at DESC
              `
            } else {
              projects = await sqlFunc`
                SELECT id, title, description, category, image, created_at
                FROM projects
                WHERE is_featured = true AND is_visible = true
                ORDER BY created_at DESC
              `
              projects = projects.map(p => ({ ...p, media: [] }))
            }
          } else if (visible === 'true') {
            if (hasMediaColumn) {
              projects = await sqlFunc`
                SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                FROM projects
                WHERE is_visible = true
                ORDER BY created_at DESC
              `
            } else {
              projects = await sqlFunc`
                SELECT id, title, description, category, image, created_at
                FROM projects
                WHERE is_visible = true
                ORDER BY created_at DESC
              `
              projects = projects.map(p => ({ ...p, media: [] }))
            }
          } else {
            if (hasMediaColumn) {
              projects = await sqlFunc`
                SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, COALESCE(media, '[]'::jsonb) as media, created_at, updated_at
                FROM projects
                ORDER BY created_at DESC
              `
            } else {
              projects = await sqlFunc`
                SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
                FROM projects
                ORDER BY created_at DESC
              `
              projects = projects.map(p => ({ ...p, media: [] }))
            }
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              projects
            }),
          }
        }
        
        // media 컬럼 관련 에러인 경우 media 없이 재시도
        if (dbError.message && (dbError.message.includes('media') || dbError.message.includes('column') || dbError.message.includes('does not exist'))) {
          console.warn('Media 컬럼 에러, media 없이 재시도:', dbError.message)
          const { visible, featured } = event.queryStringParameters || {}
          let projects

          if (featured === 'true') {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, created_at
              FROM projects
              WHERE is_featured = true AND is_visible = true
              ORDER BY created_at DESC
            `
          } else if (visible === 'true') {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, created_at
              FROM projects
              WHERE is_visible = true
              ORDER BY created_at DESC
            `
          } else {
            projects = await sqlFunc`
              SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
              FROM projects
              ORDER BY created_at DESC
            `
          }
          
          // media 필드 추가 (빈 배열)
          projects = projects.map(p => ({ ...p, media: [] }))
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              projects
            }),
          }
        }
        
        // 다른 에러는 그대로 throw
        console.error('Projects fetch error:', dbError)
        console.error('Error stack:', dbError.stack)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: dbError.message,
            details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
          }),
        }
      } catch (outerError) {
        // 최상위 에러 핸들링
        console.error('Outer error in GET:', outerError)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 목록을 불러오는 중 오류가 발생했습니다.',
            error: outerError.message
          }),
        }
      }
    }

    // POST: 프로젝트 추가
    if (event.httpMethod === 'POST') {
      try {
      const { title, description, category, image, memo, isVisible, isFeatured, status, projectKey, startDate, endDate, media } = JSON.parse(event.body || '{}')

      if (!title) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 제목을 입력해주세요.'
          }),
        }
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
        result = await sqlFunc`
          INSERT INTO projects (title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, media)
          VALUES (${title}, ${description || null}, ${category || null}, ${image || null}, ${memo || null}, ${isVisible !== false}, ${isFeatured === true}, ${status || 'planned'}, ${projectKey || 'APP'}, ${startDate || null}, ${endDate || null}, ${mediaJson}::jsonb)
          RETURNING *
        `
      } catch (e) {
        // media 컬럼이 없으면 media 없이 INSERT
        if (e.message && e.message.includes('media')) {
          result = await sqlFunc`
            INSERT INTO projects (title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date)
            VALUES (${title}, ${description || null}, ${category || null}, ${image || null}, ${memo || null}, ${isVisible !== false}, ${isFeatured === true}, ${status || 'planned'}, ${projectKey || 'APP'}, ${startDate || null}, ${endDate || null})
            RETURNING *
          `
        } else {
          throw e
        }
      }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '프로젝트가 추가되었습니다.',
            project: result[0]
          }),
        }
      } catch (postError) {
        console.error('POST error:', postError)
        console.error('POST error stack:', postError.stack)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 추가 중 오류가 발생했습니다.',
            error: postError.message
          }),
        }
      }
    }

    // PUT: 프로젝트 수정
    if (event.httpMethod === 'PUT') {
      try {
      // 경로에서 ID 추출
      let id = event.pathParameters?.id || event.pathParameters?.splat
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/projects\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }
      if (!id && event.queryStringParameters?.id) {
        id = event.queryStringParameters.id
      }
      
      const { title, description, category, image, memo, isVisible, isFeatured, status, projectKey, startDate, endDate, media } = JSON.parse(event.body || '{}')

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 ID가 필요합니다.'
          }),
        }
      }

      const existing = await sqlFunc`
        SELECT * FROM projects WHERE id = ${parseInt(id)}
      `
      
      if (existing.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트를 찾을 수 없습니다.'
          }),
        }
      }

      // 업데이트할 필드만 업데이트
      if (title) {
        await sqlFunc`UPDATE projects SET title = ${title} WHERE id = ${parseInt(id)}`
      }
      if (description !== undefined) {
        await sqlFunc`UPDATE projects SET description = ${description} WHERE id = ${parseInt(id)}`
      }
      if (category !== undefined) {
        await sqlFunc`UPDATE projects SET category = ${category} WHERE id = ${parseInt(id)}`
      }
      if (image !== undefined) {
        await sqlFunc`UPDATE projects SET image = ${image} WHERE id = ${parseInt(id)}`
      }
      if (memo !== undefined) {
        await sqlFunc`UPDATE projects SET memo = ${memo} WHERE id = ${parseInt(id)}`
      }
      if (isVisible !== undefined) {
        await sqlFunc`UPDATE projects SET is_visible = ${isVisible} WHERE id = ${parseInt(id)}`
      }
      if (isFeatured !== undefined) {
        await sqlFunc`UPDATE projects SET is_featured = ${isFeatured} WHERE id = ${parseInt(id)}`
      }
      if (status !== undefined) {
        await sqlFunc`UPDATE projects SET status = ${status} WHERE id = ${parseInt(id)}`
      }
      if (projectKey !== undefined) {
        await sqlFunc`UPDATE projects SET project_key = ${projectKey || 'APP'} WHERE id = ${parseInt(id)}`
      }
      if (startDate !== undefined) {
        await sqlFunc`UPDATE projects SET start_date = ${startDate || null} WHERE id = ${parseInt(id)}`
      }
      if (endDate !== undefined) {
        await sqlFunc`UPDATE projects SET end_date = ${endDate || null} WHERE id = ${parseInt(id)}`
      }
      if (media !== undefined) {
        try {
          const mediaJson = media ? JSON.stringify(media) : '[]'
          await sqlFunc`UPDATE projects SET media = ${mediaJson}::jsonb WHERE id = ${parseInt(id)}`
        } catch (e) {
          // media 컬럼이 없으면 무시
          if (e.message && e.message.includes('media')) {
            console.warn('media 컬럼이 없어 업데이트를 건너뜁니다.')
          } else {
            throw e
          }
        }
      }
      
      await sqlFunc`UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ${parseInt(id)}`

      const result = await sqlFunc`
        SELECT * FROM projects WHERE id = ${parseInt(id)}
      `

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '프로젝트가 수정되었습니다.',
            project: result[0]
          }),
        }
      } catch (putError) {
        console.error('PUT error:', putError)
        console.error('PUT error stack:', putError.stack)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 수정 중 오류가 발생했습니다.',
            error: putError.message
          }),
        }
      }
    }

    // DELETE: 프로젝트 삭제
    if (event.httpMethod === 'DELETE') {
      try {
      // 경로에서 ID 추출
      let id = event.pathParameters?.id || event.pathParameters?.splat
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/projects\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }
      if (!id && event.queryStringParameters?.id) {
        id = event.queryStringParameters.id
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 ID가 필요합니다.'
          }),
        }
      }

      const project = await sqlFunc`
        SELECT * FROM projects WHERE id = ${parseInt(id)}
      `
      
      if (project.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트를 찾을 수 없습니다.'
          }),
        }
      }

      await sqlFunc`DELETE FROM projects WHERE id = ${parseInt(id)}`

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '프로젝트가 삭제되었습니다.'
          }),
        }
      } catch (deleteError) {
        console.error('DELETE error:', deleteError)
        console.error('DELETE error stack:', deleteError.stack)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 삭제 중 오류가 발생했습니다.',
            error: deleteError.message
          }),
        }
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: '지원하지 않는 HTTP 메서드입니다.'
      }),
    }
  } catch (error) {
    console.error('Projects API top-level error:', error)
    console.error('Error stack:', error.stack)
    console.error('Event:', JSON.stringify(event, null, 2))
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    }
  }
}


