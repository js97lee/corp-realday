import { 
  handleOptionsRequest, 
  ensureDatabaseInitialized, 
  executeQuery, 
  createErrorResponse, 
  createSuccessResponse 
} from './utils.js'

export const handler = async (event, context) => {
  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  // GET 요청만 허용
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    }
  }

  try {
    const sqlFunc = await ensureDatabaseInitialized(context)
    
    // Contact 목록 조회 (타임아웃 포함)
    const contacts = await executeQuery(
      sqlFunc`SELECT * FROM contacts ORDER BY created_at DESC`,
      context
    )

    return createSuccessResponse({ contacts })
  } catch (error) {
    console.error('Contacts fetch error:', error)
    return createErrorResponse(error, context)
  }
}

