import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, updateProject } from '../utils/api'

function AdminPortfolio() {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterFeatured, setFilterFeatured] = useState(false) // 랜딩페이지 노출 여부 필터
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
    isFeatured: false,
  })
  const navigate = useNavigate()

  // 프로젝트 목록 불러오기
  const loadProjects = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPortfolio.jsx:23',message:'loadProjects entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    try {
      setLoading(true)
      setError('')
      console.log('랜딩페이지 관리 - 프로젝트 목록 불러오기 시작...')
      // #region agent log
      const fetchStartTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPortfolio.jsx:28',message:'fetchProjects call',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      const response = await fetchProjects(false) // 관리자용: 모든 프로젝트
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPortfolio.jsx:29',message:'fetchProjects response',data:{success:response?.success,projectsCount:response?.projects?.length||0,duration:Date.now()-fetchStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.log('랜딩페이지 관리 - 프로젝트 목록 응답:', response)
      if (response && (response.success || response.projects)) {
        // 데이터베이스 필드명을 컴포넌트 필드명으로 변환
        const formattedProjects = (response.projects || []).map(p => {
          // media 필드 안전하게 처리
          let media = []
          try {
            if (p.media) {
              if (typeof p.media === 'string') {
                if (p.media && p.media !== 'null' && p.media !== 'undefined') {
                  media = JSON.parse(p.media)
                }
              } else if (Array.isArray(p.media)) {
                media = p.media
              }
            }
          } catch (e) {
            console.warn('Media 파싱 실패:', e, p.media)
            media = []
          }
          
          return {
            id: p.id,
            title: p.title,
            description: p.description || '',
            category: p.category || '',
            image: p.image || '',
            isVisible: p.is_visible !== false,
            isFeatured: p.is_featured === true,
            status: p.status || 'planned',
            startDate: p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : '',
            endDate: p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : '',
            media: media,
            createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }
        })
        
        setProjects(formattedProjects)
      } else {
        // 응답이 없거나 형식이 잘못된 경우 빈 배열 설정
        console.warn('예상치 못한 응답 형식:', response)
        setProjects([])
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fe74a1d8-c534-4ffd-9b9c-47a74779d2d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminPortfolio.jsx:72',message:'loadProjects error',data:{message:err.message,status:err.status,details:err.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      console.error('❌ [랜딩페이지 관리] 프로젝트 목록 불러오기 실패:', err)
      console.error('📍 에러 위치: AdminPortfolio.jsx > loadProjects()')
      console.error('🔍 에러 상세:', {
        message: err.message,
        status: err.status,
        details: err.details,
        stack: err.stack
      })
      
      // 에러 발생 시 빈 배열 설정하여 빈 화면 방지
      setProjects([])
      
      // 에러 메시지 구성
      let errorMessage = '❌ 랜딩페이지 관리 - 프로젝트 목록을 불러올 수 없습니다.\n\n'
      errorMessage += '📍 발생 위치: 랜딩페이지 관리 페이지\n'
      errorMessage += '🔧 작업 내용: 프로젝트 목록 조회\n\n'
      
      // HTTP 상태 코드별 메시지
      if (err.status === 502) {
        errorMessage += '⚠️ 서버 게이트웨이 오류 (502)\n'
        errorMessage += '→ 백엔드 서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.'
      } else if (err.status === 503) {
        errorMessage += '⚠️ 서비스 일시 중단 (503)\n'
        errorMessage += '→ 서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
      } else if (err.status === 504) {
        errorMessage += '⚠️ 게이트웨이 타임아웃 (504)\n'
        errorMessage += '→ 서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
      } else if (err.status >= 500) {
        errorMessage += `⚠️ 서버 오류 (${err.status})\n`
        errorMessage += '→ 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      } else if (err.status === 401 || err.status === 403) {
        errorMessage += '⚠️ 권한 오류\n'
        errorMessage += '→ 로그인이 필요하거나 권한이 없습니다. 다시 로그인해주세요.'
      } else if (err.status === 404) {
        errorMessage += '⚠️ 리소스를 찾을 수 없음 (404)\n'
        errorMessage += '→ 요청한 API 엔드포인트를 찾을 수 없습니다.'
      } else {
        errorMessage += `⚠️ 오류 발생\n`
        errorMessage += `→ ${err.message || '알 수 없는 오류가 발생했습니다.'}`
      }
      
      if (err.details) {
        errorMessage += `\n\n🔍 상세 정보: ${err.details}`
      }
      
      setError(errorMessage)
      
      // 502, 503, 504 에러인 경우 재시도 (최대 3회)
      if (err.status >= 500 && err.status <= 504) {
        const retryCount = parseInt(sessionStorage.getItem('portfolioRetryCount') || '0', 10)
        if (retryCount < 3) {
          sessionStorage.setItem('portfolioRetryCount', String(retryCount + 1))
          setLoading(false) // 재시도 전에 로딩 상태 해제
          setTimeout(() => {
            console.log(`🔄 [랜딩페이지 관리] 자동 재시도 중... (${retryCount + 1}/3)`)
            loadProjects()
          }, 3000)
          return // 재시도하는 경우 여기서 종료
        } else {
          // 재시도 횟수 초과 시 재시도 카운터 리셋
          sessionStorage.removeItem('portfolioRetryCount')
          setError(errorMessage + '\n\n⏱️ 자동 재시도 3회 실패. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/admin')
      return
    }

    // 프로젝트 목록 불러오기
    loadProjects()
  }, [navigate])

  // 필터링된 프로젝트 업데이트
  useEffect(() => {
    let filtered = projects

    // 랜딩페이지 노출 여부 필터
    if (filterFeatured) {
      filtered = filtered.filter(p => p.isFeatured === true)
    }

    setFilteredProjects(filtered)
  }, [projects, filterFeatured])

  const handleProjectClick = (project) => {
    setSelectedProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      image: project.image || '',
      isFeatured: project.isFeatured || false,
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedProject) {
      alert('프로젝트를 선택해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')

      // 프로젝트 업데이트 (is_featured만 업데이트)
      const updateData = {
        isFeatured: formData.isFeatured,
      }
      
      const response = await updateProject(selectedProject.id, updateData)
      if (response.success) {
        await loadProjects() // 목록 다시 불러오기
        setIsEditing(false)
        setSelectedProject(null)
        setFormData({ title: '', description: '', category: '', image: '', isFeatured: false })
      }
    } catch (err) {
      console.error('프로젝트 저장 실패:', err)
      setError(err.message || '프로젝트 저장에 실패했습니다.')
      alert(err.message || '프로젝트 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedProject(null)
    setFormData({ title: '', description: '', category: '', image: '', isFeatured: false })
  }

  const toggleFeatured = async (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    try {
      setLoading(true)
      const response = await updateProject(projectId, {
        isFeatured: !project.isFeatured
      })
      if (response.success) {
        await loadProjects() // 목록 다시 불러오기
      }
    } catch (err) {
      console.error('랜딩페이지 노출 상태 변경 실패:', err)
      alert(err.message || '랜딩페이지 노출 상태 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">랜딩페이지 관리</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.checked)}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">랜딩페이지 노출 항목만 보기</span>
          </label>
          <div className="text-sm text-gray-500">
            총 {projects.length}개 프로젝트 중 {projects.filter(p => p.isFeatured).length}개가 랜딩페이지에 노출됨
          </div>
        </div>
      </div>

      {loading && !isEditing && (
        <div className="text-center py-4 text-gray-500">
          로딩 중...
        </div>
      )}

      {/* 편집 폼 */}
      {isEditing && selectedProject && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">랜딩페이지 노출 설정</h3>
          
          <div className="space-y-4">
            {/* 프로젝트 정보 미리보기 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-lg font-semibold mb-2">{formData.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
              {formData.category && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {formData.category}
                </span>
              )}
              {formData.image && (
                <div className="mt-4">
                  <img
                    src={formData.image}
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* 랜딩페이지 노출 설정 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                랜딩페이지 메인에 노출
              </label>
              <span className="ml-2 text-xs text-gray-500">(랜딩페이지 메인에 표시)</span>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 목록 (아카이브 형식) */}
      {!isEditing && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold">프로젝트 목록</h3>
          </div>
          <div className="p-4">
            {filteredProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {filterFeatured ? '랜딩페이지에 노출된 프로젝트가 없습니다.' : '프로젝트가 없습니다.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
                      project.isFeatured ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleProjectClick(project)}
                  >
                    {/* 이미지 영역 */}
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* 랜딩페이지 노출 배지 */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {project.isFeatured && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500 text-white">
                            랜딩
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 카드 내용 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">{project.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        {project.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {project.category}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFeatured(project.id)
                          }}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            project.isFeatured
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {project.isFeatured ? '노출 중' : '노출하기'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPortfolio
