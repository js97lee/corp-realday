import { getSql, initDatabase } from './db.js'

// 데이터베이스 초기화 (최초 실행 시만)
let dbInitialized = false

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

  // 남은 실행 시간 확인 (Netlify Functions 제한 고려)
  const getRemainingTime = () => {
    if (context && context.getRemainingTimeInMillis) {
      return context.getRemainingTimeInMillis()
    }
    return 10000 // 기본값 10초
  }

  const remainingTime = getRemainingTime()
  const queryTimeout = Math.min(5000, remainingTime - 2000) // 쿼리 타임아웃: 최대 5초, 남은 시간 - 2초 중 작은 값
  const initTimeout = Math.min(2000, remainingTime - 1000) // 초기화 타임아웃: 최대 2초, 남은 시간 - 1초 중 작은 값

  try {
    // 데이터베이스 초기화 (한 번만 실행 - 성능 최적화)
    if (!dbInitialized) {
      try {
        // initDatabase 타임아웃 설정 (동적)
        await Promise.race([
          initDatabase(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database initialization timeout')), initTimeout))
        ])
        dbInitialized = true
      } catch (initError) {
        console.error('Database initialization error:', initError)
        // 초기화 실패는 치명적이므로 에러 반환
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            success: false,
            message: '데이터베이스 초기화에 실패했습니다.',
            error: initError.message
          }),
        }
      }
    }
    
    // 데이터베이스 연결 (간단하게)
    const sqlFunc = getSql()

    // GET: 프로젝트 목록 조회
    if (event.httpMethod === 'GET') {
      const { visible, featured } = event.queryStringParameters || {}
      console.log('GET projects request:', { visible, featured })
      
      let projects

      try {
        // 쿼리 실행 (간단하게, 타임아웃만 설정)
        try {
          if (featured === 'true') {
            // 랜딩페이지용: featured 프로젝트만
            projects = await Promise.race([
              sqlFunc`
                SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                FROM projects
                WHERE is_featured = true AND is_visible = true
                ORDER BY created_at DESC
              `,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
            ])
          } else if (visible === 'true') {
            // Projects 페이지용: 노출된 프로젝트만
            projects = await Promise.race([
              sqlFunc`
                SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                FROM projects
                WHERE is_visible = true
                ORDER BY created_at DESC
              `,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
            ])
          } else {
            // 관리자용: 모든 프로젝트
            projects = await Promise.race([
              sqlFunc`
                SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, COALESCE(media, '[]'::jsonb) as media, created_at, updated_at
                FROM projects
                ORDER BY created_at DESC
              `,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
            ])
          }
          
          console.log('✅ 쿼리 실행 성공:', { count: projects?.length || 0 })
        } catch (queryError) {
          // media 컬럼이 없으면 media 없이 재시도
          if (queryError.message && queryError.message.includes('media')) {
            console.warn('Media 컬럼 에러, media 없이 재시도')
            try {
              if (featured === 'true') {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, created_at
                    FROM projects
                    WHERE is_featured = true AND is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
                projects = (projects || []).map(p => ({ ...p, media: [] }))
              } else if (visible === 'true') {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, created_at
                    FROM projects
                    WHERE is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
                projects = (projects || []).map(p => ({ ...p, media: [] }))
              } else {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
                    FROM projects
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
                projects = (projects || []).map(p => ({ ...p, media: [] }))
              }
            } catch (retryError) {
              console.error('❌ 재시도 실패:', retryError)
              throw retryError
            }
          } else {
            console.error('❌ Query execution error:', queryError)
            throw queryError
          }
        }

        // 결과가 배열이 아닌 경우 처리
        if (!Array.isArray(projects)) {
          console.warn('Projects is not an array:', typeof projects, projects)
          projects = []
        }

        console.log('Projects fetched successfully:', { count: projects?.length || 0, featured, visible })
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            projects: projects || []
          }),
        }
      } catch (dbError) {
        // 테이블이 없으면 초기화 후 재시도 (타임아웃 설정)
        if (dbError.message && dbError.message.includes('does not exist')) {
          console.log('테이블이 없어서 초기화 후 재시도...')
          try {
            await Promise.race([
              initDatabase(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Init timeout')), initTimeout))
            ])
            dbInitialized = true // 플래그 업데이트
          } catch (initErr) {
            console.error('재시도 중 초기화 실패:', initErr)
            return {
              statusCode: 503,
              headers,
              body: JSON.stringify({
                success: false,
                message: '데이터베이스 초기화에 실패했습니다.',
                error: initErr.message
              }),
            }
          }
          
          const { visible, featured } = event.queryStringParameters || {}
          let projects

          // media 컬럼 존재 여부 확인 (타임아웃 설정)
          let hasMediaColumn = false
          try {
            const columnCheck = await Promise.race([
              sqlFunc`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'projects' AND column_name = 'media'
              `,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Column check timeout')), Math.min(2000, queryTimeout)))
            ])
            hasMediaColumn = columnCheck.length > 0
          } catch (e) {
            console.warn('Media 컬럼 확인 실패 (기본값: false):', e.message)
            hasMediaColumn = false
          }

          // 재시도 쿼리 실행 (타임아웃 설정)
          try {
            if (featured === 'true') {
              if (hasMediaColumn) {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                    FROM projects
                    WHERE is_featured = true AND is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
              } else {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, created_at
                    FROM projects
                    WHERE is_featured = true AND is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
                projects = (projects || []).map(p => ({ ...p, media: [] }))
              }
            } else if (visible === 'true') {
              if (hasMediaColumn) {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                    FROM projects
                    WHERE is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
              } else {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, created_at
                    FROM projects
                    WHERE is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
                projects = (projects || []).map(p => ({ ...p, media: [] }))
              }
            } else {
              if (hasMediaColumn) {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, COALESCE(media, '[]'::jsonb) as media, created_at, updated_at
                    FROM projects
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
              } else {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
                    FROM projects
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
                ])
                projects = (projects || []).map(p => ({ ...p, media: [] }))
              }
            }
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                projects: projects || []
              }),
            }
          } catch (retryError) {
            console.error('재시도 쿼리 실행 실패:', retryError)
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({
                success: false,
                message: '프로젝트 조회에 실패했습니다.',
                error: retryError.message
              }),
            }
          }
        }
        
        // media 컬럼 관련 에러인 경우 media 없이 재시도 (타임아웃 설정)
        if (dbError.message && (dbError.message.includes('media') || dbError.message.includes('column') || dbError.message.includes('does not exist'))) {
          console.warn('Media 컬럼 에러, media 없이 재시도:', dbError.message)
          const { visible, featured } = event.queryStringParameters || {}
          let projects

          try {
            if (featured === 'true') {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, created_at
                  FROM projects
                  WHERE is_featured = true AND is_visible = true
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
              ])
            } else if (visible === 'true') {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, created_at
                  FROM projects
                  WHERE is_visible = true
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
              ])
            } else {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
                  FROM projects
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
              ])
            }
            
            // media 필드 추가 (빈 배열)
            projects = (projects || []).map(p => ({ ...p, media: [] }))
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                projects: projects || []
              }),
            }
          } catch (retryError) {
            console.error('Media 없이 재시도 실패:', retryError)
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({
                success: false,
                message: '프로젝트 조회에 실패했습니다.',
                error: retryError.message
              }),
            }
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

      const existing = await Promise.race([
        sqlFunc`SELECT * FROM projects WHERE id = ${parseInt(id)}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
      ])
      
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

      // 기존 데이터 가져오기
      const current = existing[0]

      // 업데이트할 값 결정 (undefined가 아닌 경우에만 업데이트)
      const updateTitle = title !== undefined ? title : current.title
      const updateDescription = description !== undefined ? description : current.description
      const updateCategory = category !== undefined ? category : current.category
      const updateImage = image !== undefined ? image : current.image
      const updateMemo = memo !== undefined ? memo : current.memo
      const updateIsVisible = isVisible !== undefined ? isVisible : current.is_visible
      const updateIsFeatured = isFeatured !== undefined ? isFeatured : current.is_featured
      const updateStatus = status !== undefined ? status : current.status
      const updateProjectKey = projectKey !== undefined ? (projectKey || 'APP') : current.project_key
      const updateStartDate = startDate !== undefined ? startDate : current.start_date
      const updateEndDate = endDate !== undefined ? endDate : current.end_date
      
      // media 처리
      let updateMedia = current.media
      if (media !== undefined) {
        try {
          const mediaJson = media ? JSON.stringify(media) : '[]'
          // media 컬럼 존재 여부 확인 후 업데이트
          try {
            // 단일 UPDATE 쿼리로 모든 필드 업데이트 (타임아웃 설정)
            const result = await Promise.race([
              sqlFunc`
                UPDATE projects
                SET title = ${updateTitle},
                    description = ${updateDescription},
                    category = ${updateCategory},
                    image = ${updateImage},
                    memo = ${updateMemo},
                    is_visible = ${updateIsVisible},
                    is_featured = ${updateIsFeatured},
                    status = ${updateStatus},
                    project_key = ${updateProjectKey},
                    start_date = ${updateStartDate || null},
                    end_date = ${updateEndDate || null},
                    media = ${mediaJson}::jsonb,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${parseInt(id)}
                RETURNING *
              `,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
            ])
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                message: '프로젝트가 수정되었습니다.',
                project: result[0]
              }),
            }
          } catch (e) {
            // media 컬럼이 없으면 media 없이 업데이트
            if (e.message && e.message.includes('media')) {
              console.warn('media 컬럼이 없어 media 없이 업데이트합니다.')
              const result = await Promise.race([
                sqlFunc`
                  UPDATE projects
                  SET title = ${updateTitle},
                      description = ${updateDescription},
                      category = ${updateCategory},
                      image = ${updateImage},
                      memo = ${updateMemo},
                      is_visible = ${updateIsVisible},
                      is_featured = ${updateIsFeatured},
                      status = ${updateStatus},
                      project_key = ${updateProjectKey},
                      start_date = ${updateStartDate || null},
                      end_date = ${updateEndDate || null},
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ${parseInt(id)}
                  RETURNING *
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
              ])
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  success: true,
                  message: '프로젝트가 수정되었습니다.',
                  project: result[0]
                }),
              }
            } else {
              throw e
            }
          }
        } catch (e) {
          throw e
        }
      } else {
        // media가 undefined인 경우 기존 media 유지
        try {
          // 단일 UPDATE 쿼리로 모든 필드 업데이트 (타임아웃 설정)
          const result = await Promise.race([
            sqlFunc`
              UPDATE projects
              SET title = ${updateTitle},
                  description = ${updateDescription},
                  category = ${updateCategory},
                  image = ${updateImage},
                  memo = ${updateMemo},
                  is_visible = ${updateIsVisible},
                  is_featured = ${updateIsFeatured},
                  status = ${updateStatus},
                  project_key = ${updateProjectKey},
                  start_date = ${updateStartDate || null},
                  end_date = ${updateEndDate || null},
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ${parseInt(id)}
              RETURNING *
            `,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
          ])
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: '프로젝트가 수정되었습니다.',
              project: result[0]
            }),
          }
        } catch (e) {
          // media 컬럼이 있는 경우 media도 포함하여 업데이트 재시도
          if (e.message && !e.message.includes('media')) {
            throw e
          }
          // media 컬럼이 없으면 위의 쿼리로 충분
          throw e
        }
      }

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

      const project = await Promise.race([
        sqlFunc`SELECT * FROM projects WHERE id = ${parseInt(id)}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
      ])
      
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

      await Promise.race([
        sqlFunc`DELETE FROM projects WHERE id = ${parseInt(id)}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), queryTimeout))
      ])

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
    // 상세한 에러 로깅
    console.error('❌ [Projects API] Top-level error 발생')
    console.error('📍 에러 위치: netlify/functions/projects.js > handler()')
    console.error('🔍 에러 상세:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      httpMethod: event.httpMethod,
      path: event.path,
      queryParams: event.queryStringParameters,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      remainingTime: context?.getRemainingTimeInMillis?.() || 'unknown'
    })
    
    // 타임아웃 에러인 경우
    if (error.message && (error.message.includes('timeout') || error.message.includes('Timeout'))) {
      console.error('⏱️ 타임아웃 에러 감지')
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({
          success: false,
          message: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
          error: 'Timeout',
          details: '서버 응답 시간이 초과되었습니다. 데이터베이스 연결이나 쿼리 실행이 너무 오래 걸렸습니다.'
        }),
      }
    }
    
    // 데이터베이스 연결 에러인 경우
    if (error.message && (error.message.includes('connection') || error.message.includes('database') || error.message.includes('DATABASE_URL'))) {
      console.error('🔌 데이터베이스 연결 에러 감지')
      const hasDatabaseUrl = !!process.env.DATABASE_URL
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          success: false,
          message: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
          error: 'Database connection failed',
          details: hasDatabaseUrl 
            ? 'DATABASE_URL은 설정되어 있지만 연결에 실패했습니다. 데이터베이스 서버 상태를 확인해주세요.'
            : 'DATABASE_URL이 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.'
        }),
      }
    }
    
    // 일반 서버 에러
    console.error('⚠️ 일반 서버 에러')
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : '서버에서 예상치 못한 오류가 발생했습니다.'
      }),
    }
  }
}


