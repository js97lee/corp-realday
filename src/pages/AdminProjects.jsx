import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isManagerOrAbove, getUserRole, USER_ROLES } from '../utils/auth'
import { fetchProjects, addProject, updateProject, deleteProject, fetchTasks } from '../utils/api'

function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState(['Web Development', 'Design', 'Mobile', 'Branding', 'Marketing'])
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
    imageFile: null,
    memo: '',
    isVisible: true,
    isFeatured: false,
    status: 'planned',
    projectKey: 'APP',
    startDate: '',
    endDate: '',
    media: [],
  })
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaType, setNewMediaType] = useState('image')
  const [newMediaContent, setNewMediaContent] = useState('') // 텍스트나 임베드용
  const [relatedTasks, setRelatedTasks] = useState([])
  const navigate = useNavigate()

  // 프로젝트 목록 불러오기
  const loadProjects = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('프로젝트 목록 불러오기 시작...')
      const response = await fetchProjects(false) // 관리자용: 모든 프로젝트
      console.log('프로젝트 목록 응답:', response)
      if (response && (response.success || response.projects)) {
        // 직원은 진행 중인 프로젝트만 볼 수 있음
        const userRole = getUserRole()
        let filteredProjects = response.projects || []
        
        if (userRole === USER_ROLES.EMPLOYEE) {
          filteredProjects = filteredProjects.filter(p => p.status === 'inProgress')
        }
        
        // 데이터베이스 필드명을 컴포넌트 필드명으로 변환
        const formattedProjects = filteredProjects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          category: p.category || '',
          image: p.image || '',
          memo: p.memo || '',
          isVisible: p.is_visible !== false,
          isFeatured: p.is_featured === true,
          status: p.status || 'planned',
          projectKey: p.project_key || 'APP',
          startDate: p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : '',
          endDate: p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : '',
          media: (() => {
            try {
              if (!p.media) return []
              if (typeof p.media === 'string') {
                // 빈 문자열이거나 'null'인 경우 빈 배열 반환
                if (!p.media || p.media === 'null' || p.media === 'undefined') return []
                return JSON.parse(p.media)
              }
              return Array.isArray(p.media) ? p.media : []
            } catch (e) {
              console.warn('Media 파싱 실패:', e, p.media)
              return []
            }
          })(),
          createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }))
        
        setProjects(formattedProjects)

        // 프로젝트에서 사용된 카테고리도 목록에 추가
        const projectCategories = formattedProjects.map(p => p.category).filter(Boolean)
        setCategories(prev => {
          const combined = [...prev, ...projectCategories]
          return [...new Set(combined)] // 중복 제거
        })
      }
    } catch (err) {
      console.error('프로젝트 목록 불러오기 실패:', err)
      console.error('에러 상세:', err.details || err.stack)
      const errorMessage = err.message || '프로젝트 목록을 불러올 수 없습니다.'
      const detailsMessage = err.details ? ` (${err.details})` : ''
      setError(`${errorMessage}${detailsMessage}`)
      
      // 502, 503, 504 에러인 경우 재시도 안내
      if (err.status >= 500) {
        setLoading(false) // 재시도 전에 로딩 상태 해제
        setTimeout(() => {
          console.log('자동 재시도 중...')
          loadProjects()
        }, 3000)
        return // 재시도하는 경우 여기서 종료
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

  const handleProjectClick = async (project) => {
    setSelectedProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      image: project.image || '',
      imageFile: null,
      memo: project.memo || '',
      isVisible: project.isVisible,
      isFeatured: project.isFeatured || false,
      status: project.status || 'planned',
      projectKey: project.projectKey || 'APP',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      media: project.media || [],
    })
    setIsEditing(true)
    
    // 연관된 티켓 불러오기
    try {
      const tasksResponse = await fetchTasks()
      if (tasksResponse.success) {
        const related = (tasksResponse.tasks || []).filter(task => task.project_id === project.id)
        setRelatedTasks(related)
      }
    } catch (err) {
      console.error('연관 티켓 불러오기 실패:', err)
      setRelatedTasks([])
    }
  }

  const handleSave = async () => {
    if (!formData.title) {
      alert('프로젝트 제목을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')

      if (selectedProject) {
        // 프로젝트 업데이트
        const updateData = {
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          image: formData.image || null,
          memo: formData.memo || null,
          isVisible: formData.isVisible,
          isFeatured: formData.isFeatured,
          status: formData.status || 'planned',
          projectKey: formData.projectKey || 'APP',
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          media: formData.media || [],
        }
        
        const response = await updateProject(selectedProject.id, updateData)
        if (response.success) {
          await loadProjects() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedProject(null)
          setShowNewCategoryInput(false)
          setNewCategory('')
          setFormData({ title: '', description: '', category: '', image: '', imageFile: null, memo: '', isVisible: true, isFeatured: false, status: 'planned', projectKey: 'APP', startDate: '', endDate: '', media: [] })
          const fileInput = document.getElementById('imageFile')
          if (fileInput) fileInput.value = ''
        }
      } else {
        // 새 프로젝트 추가
        const response = await addProject({
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          image: formData.image || null,
          memo: formData.memo || null,
          isVisible: formData.isVisible,
          isFeatured: formData.isFeatured,
          status: formData.status || 'planned',
          projectKey: formData.projectKey || 'APP',
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          media: formData.media || [],
        })
        if (response.success) {
          await loadProjects() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedProject(null)
          setShowNewCategoryInput(false)
          setNewCategory('')
          setFormData({ title: '', description: '', category: '', image: '', imageFile: null, memo: '', isVisible: true, isFeatured: false, status: 'planned', projectKey: 'APP', startDate: '', endDate: '', media: [] })
          const fileInput = document.getElementById('imageFile')
          if (fileInput) fileInput.value = ''
        }
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
    setShowNewCategoryInput(false)
    setNewCategory('')
    setFormData({ title: '', description: '', category: '', image: '', imageFile: null, memo: '', isVisible: true })
    const fileInput = document.getElementById('imageFile')
    if (fileInput) fileInput.value = ''
  }

  const toggleVisibility = async (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    try {
      setLoading(true)
      const response = await updateProject(projectId, {
        isVisible: !project.isVisible
      })
      if (response.success) {
        await loadProjects() // 목록 다시 불러오기
      }
    } catch (err) {
      console.error('프로젝트 노출 상태 변경 실패:', err)
      alert(err.message || '프로젝트 노출 상태 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (project) => {
    try {
      setLoading(true)
      setError('')
      
      const copyData = {
        title: `${project.title} (복사본)`,
        description: project.description || null,
        category: project.category || null,
        image: project.image || null,
        memo: project.memo || null,
        isVisible: false, // 복사본은 기본적으로 숨김
        isFeatured: false,
        status: 'planned', // 복사본은 기본적으로 계획됨 상태
        projectKey: project.projectKey || 'APP',
        startDate: null, // 날짜는 초기화
        endDate: null,
      }
      
      const response = await addProject(copyData)
      if (response && response.success) {
        await loadProjects() // 목록 다시 불러오기
        alert('프로젝트가 복사되었습니다.')
      } else {
        throw new Error(response?.message || '프로젝트 복사에 실패했습니다.')
      }
    } catch (err) {
      console.error('프로젝트 복사 실패:', err)
      const errorMessage = err.message || '프로젝트 복사에 실패했습니다. 서버 연결을 확인해주세요.'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId) => {
    if (!window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)
      const response = await deleteProject(projectId)
      if (response.success) {
        await loadProjects() // 목록 다시 불러오기
        if (selectedProject?.id === projectId) {
          setIsEditing(false)
          setSelectedProject(null)
        }
      }
    } catch (err) {
      console.error('프로젝트 삭제 실패:', err)
      alert(err.message || '프로젝트 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const trimmedCategory = newCategory.trim()
      setCategories([...categories, trimmedCategory])
      setFormData({ ...formData, category: trimmedCategory })
      setNewCategory('')
      setShowNewCategoryInput(false)
    }
  }

  const userRole = getUserRole()
  const isEmployee = userRole === USER_ROLES.EMPLOYEE

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isEmployee ? '진행 중인 프로젝트' : '프로젝트 관리'}
        </h2>
        {!isEditing && !isEmployee && (
          <button
            onClick={() => {
              setSelectedProject(null)
              setFormData({ title: '', description: '', category: '', image: '', imageFile: null, memo: '', isVisible: true, isFeatured: false, status: 'planned', projectKey: 'APP', startDate: '', endDate: '', media: [] })
              setIsEditing(true)
            }}
            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
            disabled={loading}
          >
            새 프로젝트 추가
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && !isEditing && (
        <div className="text-center py-4 text-gray-500">
          로딩 중...
        </div>
      )}

      {isEditing && !isEmployee ? (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-semibold mb-4">
            {selectedProject ? '프로젝트 수정' : '새 프로젝트 추가'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="프로젝트 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                placeholder="프로젝트 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 키 (업무 키 접두사)
              </label>
              <input
                type="text"
                value={formData.projectKey}
                onChange={(e) => setFormData({ ...formData, projectKey: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="예: APP, K-POP, WEB 등"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                이 프로젝트의 업무는 "{formData.projectKey || 'APP'}-1", "{formData.projectKey || 'APP'}-2" 형식으로 생성됩니다.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <div className="space-y-2">
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowNewCategoryInput(true)
                      setFormData({ ...formData, category: '' })
                    } else {
                      setFormData({ ...formData, category: e.target.value })
                      setShowNewCategoryInput(false)
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="new">+ 새 카테고리 추가</option>
                </select>
                
                {showNewCategoryInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newCategory.trim()) {
                          handleAddCategory()
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      placeholder="새 카테고리 이름 입력"
                      autoFocus
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                      className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => {
                        setShowNewCategoryInput(false)
                        setNewCategory('')
                        setFormData({ ...formData, category: '' })
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지
              </label>
              <div className="space-y-3">
                {/* 파일 선택 */}
                <div>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({
                            ...formData,
                            imageFile: file,
                            image: reader.result,
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageFile"
                    className="inline-block px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors rounded-lg cursor-pointer"
                  >
                    파일 선택
                  </label>
                  {formData.imageFile && (
                    <span className="ml-3 text-sm text-gray-600">
                      {formData.imageFile.name}
                    </span>
                  )}
                </div>

                {/* 또는 URL 입력 */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">또는 URL 입력</p>
                  <input
                    type="url"
                    value={formData.image && !formData.imageFile ? formData.image : ''}
                    onChange={(e) => {
                      if (!formData.imageFile) {
                        setFormData({ ...formData, image: e.target.value })
                      }
                    }}
                    disabled={!!formData.imageFile}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* 이미지 미리보기 */}
                {formData.image && (
                  <div className="mt-4">
                    <img
                      src={formData.image}
                      alt="미리보기"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    {formData.imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: '', imageFile: null })
                          const fileInput = document.getElementById('imageFile')
                          if (fileInput) fileInput.value = ''
                        }}
                        className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors rounded"
                      >
                        이미지 제거
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 콘텐츠 추가 - Behance 스타일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                콘텐츠 추가
              </label>
              
              {/* 콘텐츠 타입 선택 버튼 그리드 */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('image')
                    setNewMediaContent('')
                  }}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    newMediaType === 'image' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">이미지</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('text')
                    setNewMediaUrl('')
                  }}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    newMediaType === 'text' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span className="text-xs font-medium">텍스트</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('photoGrid')
                    setNewMediaContent('')
                  }}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    newMediaType === 'photoGrid' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span className="text-xs font-medium">포토 그리드</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('video')
                    setNewMediaContent('')
                  }}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    newMediaType === 'video' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium">비디오</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('embed')
                    setNewMediaUrl('')
                  }}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    newMediaType === 'embed' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="text-xs font-medium">임베드</span>
                </button>
              </div>
              
              {/* 콘텐츠 입력 영역 */}
              <div className="space-y-4">
                {newMediaType === 'text' ? (
                  <div className="space-y-2">
                    <textarea
                      value={newMediaContent}
                      onChange={(e) => setNewMediaContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                      rows="4"
                      placeholder="텍스트 내용을 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMediaContent.trim()) {
                          setFormData({
                            ...formData,
                            media: [...(formData.media || []), { type: 'text', content: newMediaContent.trim() }]
                          })
                          setNewMediaContent('')
                        }
                      }}
                      disabled={!newMediaContent.trim()}
                      className="w-full px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                ) : newMediaType === 'embed' ? (
                  <div className="space-y-2">
                    <textarea
                      value={newMediaContent}
                      onChange={(e) => setNewMediaContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none font-mono text-sm"
                      rows="4"
                      placeholder="임베드 코드를 입력하세요 (iframe, script 등)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMediaContent.trim()) {
                          setFormData({
                            ...formData,
                            media: [...(formData.media || []), { type: 'embed', content: newMediaContent.trim() }]
                          })
                          setNewMediaContent('')
                        }
                      }}
                      disabled={!newMediaContent.trim()}
                      className="w-full px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                ) : newMediaType === 'photoGrid' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      placeholder="이미지 URL을 쉼표로 구분하여 입력 (예: url1, url2, url3, url4)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMediaUrl.trim()) {
                          const urls = newMediaUrl.split(',').map(url => url.trim()).filter(Boolean)
                          if (urls.length > 0) {
                            setFormData({
                              ...formData,
                              media: [...(formData.media || []), { type: 'photoGrid', urls: urls }]
                            })
                            setNewMediaUrl('')
                          }
                        }
                      }}
                      disabled={!newMediaUrl.trim()}
                      className="w-full px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      placeholder={newMediaType === 'image' ? '이미지 URL 입력' : '비디오 URL 입력 (YouTube 또는 직접 링크)'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMediaUrl.trim()) {
                          setFormData({
                            ...formData,
                            media: [...(formData.media || []), { type: newMediaType, url: newMediaUrl.trim() }]
                          })
                          setNewMediaUrl('')
                        }
                      }}
                      disabled={!newMediaUrl.trim()}
                      className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 미디어 목록 */}
            {formData.media && formData.media.length > 0 && (
                  <div className="space-y-3 border border-gray-200 rounded-lg p-4 mt-4">
                    {formData.media.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded">
                              {item.type === 'image' ? '이미지' : 
                               item.type === 'video' ? '비디오' :
                               item.type === 'text' ? '텍스트' :
                               item.type === 'photoGrid' ? '포토 그리드' :
                               item.type === 'embed' ? '임베드' : item.type}
                            </span>
                            {item.url && (
                              <span className="text-xs text-gray-600 truncate">{item.url}</span>
                            )}
                            {item.content && (
                              <span className="text-xs text-gray-600 truncate">콘텐츠 입력됨</span>
                            )}
                            {item.urls && (
                              <span className="text-xs text-gray-600">{item.urls.length}개 이미지</span>
                            )}
                          </div>
                          {item.type === 'image' && item.url && (
                            <img
                              src={item.url}
                              alt={`미디어 ${index + 1}`}
                              className="w-full h-32 object-cover rounded border border-gray-300"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          )}
                          {item.type === 'video' && item.url && (
                            <div className="w-full h-32 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-500">비디오 미리보기</span>
                            </div>
                          )}
                          {item.type === 'text' && item.content && (
                            <div className="w-full p-3 bg-white rounded border border-gray-300">
                              <p className="text-sm text-gray-700 line-clamp-3">{item.content}</p>
                            </div>
                          )}
                          {item.type === 'photoGrid' && item.urls && (
                            <div className="grid grid-cols-2 gap-2">
                              {item.urls.slice(0, 4).map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`그리드 ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded border border-gray-300"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          {item.type === 'embed' && item.content && (
                            <div className="w-full p-3 bg-white rounded border border-gray-300">
                              <code className="text-xs text-gray-600 line-clamp-2">{item.content.substring(0, 100)}...</code>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              media: formData.media.filter((_, i) => i !== index)
                            })
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors rounded"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
              >
                <option value="planned">예정</option>
                <option value="inProgress">진행 중</option>
                <option value="completed">완료</option>
                <option value="onHold">보류</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (어드민 전용)
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                placeholder="프로젝트에 대한 내부 메모를 입력하세요 (랜딩페이지에 표시되지 않습니다)"
              />
              <p className="text-xs text-gray-500 mt-1">이 메모는 관리자만 볼 수 있습니다.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="isVisible" className="ml-2 text-sm font-medium text-gray-700">
                  Projects 페이지에 노출
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                  랜딩페이지에 노출
                </label>
                <span className="ml-2 text-xs text-gray-500">(랜딩페이지 메인에 표시)</span>
              </div>
            </div>

            {/* 연관된 티켓 표시 */}
            {selectedProject && relatedTasks.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">연관된 티켓 ({relatedTasks.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {relatedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500">{task.task_key}</span>
                        <span className="text-sm font-medium text-gray-900">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          task.status === 'done' ? 'bg-green-100 text-green-700' :
                          task.status === 'inProgress' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'selected' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status === 'done' ? '완료' :
                           task.status === 'inProgress' ? '진행 중' :
                           task.status === 'selected' ? '선택됨' : '백로그'}
                        </span>
                        {task.assignee_name && (
                          <span className="text-xs text-gray-500">{task.assignee_name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              {selectedProject && (
                <button
                  onClick={() => handleDelete(selectedProject.id)}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold">프로젝트 목록</h3>
          </div>
          <div className="p-4">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">프로젝트가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group ${
                      isEmployee ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    onClick={() => !isEmployee && handleProjectClick(project)}
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
                      {/* 노출 상태 배지 */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {project.isFeatured && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500 text-white">
                            랜딩
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          project.isVisible 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {project.isVisible ? '노출 중' : '숨김'}
                        </span>
                      </div>
                    </div>
                    
                    {/* 카드 내용 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">{project.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                      {project.memo && (
                        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600">
                          <span className="font-medium text-yellow-700">메모:</span> {project.memo}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {project.category}
                        </span>
                        {!isEmployee && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(project)
                              }}
                              className="px-3 py-1 text-xs font-medium rounded transition-colors bg-blue-500 text-white hover:bg-blue-600"
                              title="프로젝트 복사"
                            >
                              복사
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleVisibility(project.id)
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                project.isVisible
                                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  : 'bg-black text-white hover:bg-gray-800'
                              }`}
                            >
                              {project.isVisible ? '숨기기' : '노출하기'}
                            </button>
                          </div>
                        )}
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

export default AdminProjects

