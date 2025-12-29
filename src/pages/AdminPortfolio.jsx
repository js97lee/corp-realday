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
    try {
      setLoading(true)
      setError('')
      const response = await fetchProjects(false) // 관리자용: 모든 프로젝트
      if (response.success) {
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
      }
    } catch (err) {
      console.error('프로젝트 목록 불러오기 실패:', err)
      console.error('에러 상세:', err.details || err.stack)
      const errorMessage = err.message || '프로젝트 목록을 불러올 수 없습니다.'
      const detailsMessage = err.details ? ` (${err.details})` : ''
      setError(`${errorMessage}${detailsMessage}`)
      
      // 502, 503, 504 에러인 경우 재시도 안내
      if (err.status >= 500) {
        setTimeout(() => {
          console.log('자동 재시도 중...')
          loadProjects()
        }, 3000)
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
