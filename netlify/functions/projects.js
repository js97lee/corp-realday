import { getSql, initDatabase } from './db.js'

// 데이터베이스 초기화 (최초 실행 시만)
let dbInitialized = false

export const handler = async (event, context) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:3',message:'Handler entry',data:{method:event.httpMethod,path:event.path,query:event.queryStringParameters,remainingTime:context?.getRemainingTimeInMillis?.()||'unknown',dbInitialized},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
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
    // 데이터베이스 초기화 (한 번만 실행 - 성능 최적화)
    if (!dbInitialized) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:28',message:'DB init start',data:{hasDatabaseUrl:!!process.env.DATABASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      try {
        await initDatabase()
        dbInitialized = true
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:31',message:'DB init success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      } catch (initError) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:33',message:'DB init error',data:{error:initError.message,stack:initError.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('Database initialization error:', initError)
        console.error('Init error stack:', initError.stack)
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
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:48',message:'DB already initialized',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    
    let sqlFunc
    try {
      console.log('🔌 데이터베이스 연결 시도 중...')
      sqlFunc = getSql()
      
      // DATABASE_URL 확인
      const hasDatabaseUrl = !!process.env.DATABASE_URL
      if (!hasDatabaseUrl) {
        console.error('❌ DATABASE_URL이 설정되지 않았습니다.')
        const availableEnvKeys = Object.keys(process.env).filter(key => 
          key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('NEON')
        )
        console.error('사용 가능한 환경 변수:', availableEnvKeys)
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            success: false,
            message: '데이터베이스 연결 설정 오류',
            error: 'DATABASE_URL이 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.',
            details: `사용 가능한 환경 변수: ${availableEnvKeys.join(', ') || '없음'}`
          }),
        }
      }
      
      // 연결 테스트 (타임아웃 설정: 3초로 단축)
      console.log('⏱️ 데이터베이스 연결 테스트 시작...')
      // #region agent log
      const connStartTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:66',message:'DB connection test start',data:{timeout:3000},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      await Promise.race([
        sqlFunc`SELECT 1`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout (3초 초과)')), 3000)
        )
      ])
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:72',message:'DB connection success',data:{duration:Date.now()-connStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.log('✅ 데이터베이스 연결 성공')
    } catch (sqlError) {
      console.error('❌ SQL connection error:', sqlError)
      console.error('📍 에러 위치: netlify/functions/projects.js > 데이터베이스 연결 테스트')
      console.error('🔍 에러 상세:', {
        message: sqlError.message,
        stack: sqlError.stack,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      })
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          success: false,
          message: '데이터베이스 연결에 실패했습니다.',
          error: sqlError.message,
          details: '데이터베이스 서버에 연결할 수 없습니다. 네트워크 상태나 데이터베이스 서버 상태를 확인해주세요.'
        }),
      }
    }

    // GET: 프로젝트 목록 조회
    if (event.httpMethod === 'GET') {
      try {
        const { visible, featured } = event.queryStringParameters || {}
        console.log('GET projects request:', { visible, featured, queryParams: event.queryStringParameters })
        
        // 쿼리 실행 전 연결 확인 (2초로 단축)
        try {
          await Promise.race([
            sqlFunc`SELECT 1`,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection check timeout (2초 초과)')), 2000))
          ])
        } catch (connError) {
          console.error('❌ Connection check failed:', connError)
          console.error('📍 에러 위치: netlify/functions/projects.js > GET 요청 > 연결 확인')
          return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
              success: false,
              message: '데이터베이스 연결 확인 실패',
              error: connError.message,
              details: '쿼리 실행 전 데이터베이스 연결 확인에 실패했습니다.'
            }),
          }
        }
        
        let projects

        // media 컬럼 존재 여부 확인 (타임아웃 설정)
        let hasMediaColumn = false
        // #region agent log
        const columnCheckStartTime = Date.now();
        fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:141',message:'Media column check start',data:{timeout:3000},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        try {
          const columnCheck = await Promise.race([
            sqlFunc`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'projects' AND column_name = 'media'
            `,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Column check timeout')), 3000))
          ])
          hasMediaColumn = columnCheck.length > 0
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:152',message:'Media column check result',data:{hasMediaColumn,duration:Date.now()-columnCheckStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
        } catch (e) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:153',message:'Media column check error',data:{error:e.message,duration:Date.now()-columnCheckStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          console.warn('Media 컬럼 확인 실패 (기본값: false):', e.message)
          hasMediaColumn = false
        }

        // 쿼리 실행 (타임아웃 설정: 8초로 단축 - Netlify Functions 제한 고려)
        try {
          console.log('📊 프로젝트 쿼리 실행 시작...', { featured, visible, hasMediaColumn })
          // #region agent log
          const queryStartTime = Date.now();
          fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:112',message:'Query execution start',data:{featured,visible,hasMediaColumn,timeout:8000},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          
          if (featured === 'true') {
            // 랜딩페이지용: featured 프로젝트만
            if (hasMediaColumn) {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                  FROM projects
                  WHERE is_featured = true AND is_visible = true
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
            } else {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, created_at
                  FROM projects
                  WHERE is_featured = true AND is_visible = true
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
              // media 필드 추가 (빈 배열)
              projects = (projects || []).map(p => ({ ...p, media: [] }))
            }
          } else if (visible === 'true') {
            // Projects 페이지용: 노출된 프로젝트만
            if (hasMediaColumn) {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, COALESCE(media, '[]'::jsonb) as media, created_at
                  FROM projects
                  WHERE is_visible = true
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
            } else {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, created_at
                  FROM projects
                  WHERE is_visible = true
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
              // media 필드 추가 (빈 배열)
              projects = (projects || []).map(p => ({ ...p, media: [] }))
            }
          } else {
            // 관리자용: 모든 프로젝트
            if (hasMediaColumn) {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, COALESCE(media, '[]'::jsonb) as media, created_at, updated_at
                  FROM projects
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
            } else {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
                  FROM projects
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
              // media 필드 추가 (빈 배열)
              projects = (projects || []).map(p => ({ ...p, media: [] }))
            }
          }
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:189',message:'Query execution success',data:{count:projects?.length||0,duration:Date.now()-queryStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          console.log('✅ 쿼리 실행 성공:', { count: projects?.length || 0 })
        } catch (queryError) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:191',message:'Query execution error',data:{error:queryError.message,stack:queryError.stack,queryType:featured?'featured':visible?'visible':'all',duration:Date.now()-queryStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          console.error('❌ Query execution error:', queryError)
          console.error('📍 에러 위치: netlify/functions/projects.js > GET 요청 > 쿼리 실행')
          console.error('🔍 에러 상세:', {
            message: queryError.message,
            stack: queryError.stack,
            queryType: featured ? 'featured' : visible ? 'visible' : 'all'
          })
          throw queryError
        }

        // 결과가 배열이 아닌 경우 처리
        if (!Array.isArray(projects)) {
          console.warn('Projects is not an array:', typeof projects, projects)
          projects = []
        }

        console.log('Projects fetched successfully:', { count: projects?.length || 0, featured, visible })
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:207',message:'Response ready',data:{count:projects?.length||0,featured,visible,remainingTime:context?.getRemainingTimeInMillis?.()||'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
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
              new Promise((_, reject) => setTimeout(() => reject(new Error('Init timeout (5초 초과)')), 5000))
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
              new Promise((_, reject) => setTimeout(() => reject(new Error('Column check timeout')), 2000))
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
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
                ])
              } else {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, created_at
                    FROM projects
                    WHERE is_featured = true AND is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
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
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
                ])
              } else {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, created_at
                    FROM projects
                    WHERE is_visible = true
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
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
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
                ])
              } else {
                projects = await Promise.race([
                  sqlFunc`
                    SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
                    FROM projects
                    ORDER BY created_at DESC
                  `,
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
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
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
            } else if (visible === 'true') {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, created_at
                  FROM projects
                  WHERE is_visible = true
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
              ])
            } else {
              projects = await Promise.race([
                sqlFunc`
                  SELECT id, title, description, category, image, memo, is_visible, is_featured, status, project_key, start_date, end_date, created_at, updated_at
                  FROM projects
                  ORDER BY created_at DESC
                `,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
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

      const existing = await Promise.race([
        sqlFunc`SELECT * FROM projects WHERE id = ${parseInt(id)}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
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

      // 업데이트할 필드만 업데이트 (타임아웃 설정)
      const updateQuery = async (query) => {
        return Promise.race([
          query,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])
      }

      if (title) {
        await updateQuery(sqlFunc`UPDATE projects SET title = ${title} WHERE id = ${parseInt(id)}`)
      }
      if (description !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET description = ${description} WHERE id = ${parseInt(id)}`)
      }
      if (category !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET category = ${category} WHERE id = ${parseInt(id)}`)
      }
      if (image !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET image = ${image} WHERE id = ${parseInt(id)}`)
      }
      if (memo !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET memo = ${memo} WHERE id = ${parseInt(id)}`)
      }
      if (isVisible !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET is_visible = ${isVisible} WHERE id = ${parseInt(id)}`)
      }
      if (isFeatured !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET is_featured = ${isFeatured} WHERE id = ${parseInt(id)}`)
      }
      if (status !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET status = ${status} WHERE id = ${parseInt(id)}`)
      }
      if (projectKey !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET project_key = ${projectKey || 'APP'} WHERE id = ${parseInt(id)}`)
      }
      if (startDate !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET start_date = ${startDate || null} WHERE id = ${parseInt(id)}`)
      }
      if (endDate !== undefined) {
        await updateQuery(sqlFunc`UPDATE projects SET end_date = ${endDate || null} WHERE id = ${parseInt(id)}`)
      }
      if (media !== undefined) {
        try {
          const mediaJson = media ? JSON.stringify(media) : '[]'
          await updateQuery(sqlFunc`UPDATE projects SET media = ${mediaJson}::jsonb WHERE id = ${parseInt(id)}`)
        } catch (e) {
          // media 컬럼이 없으면 무시
          if (e.message && e.message.includes('media')) {
            console.warn('media 컬럼이 없어 업데이트를 건너뜁니다.')
          } else {
            throw e
          }
        }
      }
      
      await updateQuery(sqlFunc`UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ${parseInt(id)}`)

      const result = await updateQuery(sqlFunc`
        SELECT * FROM projects WHERE id = ${parseInt(id)}
      `)

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
    // 상세한 에러 로깅
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projects.js:630',message:'Top-level error',data:{name:error.name,message:error.message,stack:error.stack,httpMethod:event.httpMethod,path:event.path,queryParams:event.queryStringParameters,hasDatabaseUrl:!!process.env.DATABASE_URL,remainingTime:context?.getRemainingTimeInMillis?.()||'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
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


