import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isManagerOrAbove, getUserRole, USER_ROLES } from '../utils/auth'
import { fetchProjects, addProject, updateProject, deleteProject } from '../utils/api'

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
    status: 'planned',
  })
  const navigate = useNavigate()

  // 프로젝트 목록 불러오기
  const loadProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchProjects(false) // 관리자용: 모든 프로젝트
      if (response.success) {
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
          status: p.status || 'planned',
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
      setError(err.message || '프로젝트 목록을 불러올 수 없습니다.')
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

  const handleProjectClick = (project) => {
    setSelectedProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      image: project.image || '',
      imageFile: null,
      memo: project.memo || '',
      isVisible: project.isVisible,
      status: project.status || 'planned',
    })
    setIsEditing(true)
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
          status: formData.status || 'planned',
        }
        
        const response = await updateProject(selectedProject.id, updateData)
        if (response.success) {
          await loadProjects() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedProject(null)
          setShowNewCategoryInput(false)
          setNewCategory('')
          setFormData({ title: '', description: '', category: '', image: '', imageFile: null, memo: '', isVisible: true, status: 'planned' })
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
          status: formData.status || 'planned',
        })
        if (response.success) {
          await loadProjects() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedProject(null)
          setShowNewCategoryInput(false)
          setNewCategory('')
          setFormData({ title: '', description: '', category: '', image: '', imageFile: null, memo: '', isVisible: true, status: 'planned' })
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
              setFormData({ title: '', description: '', category: '', image: '', imageFile: null, memo: '', isVisible: true, status: 'planned' })
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVisible"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="isVisible" className="ml-2 text-sm font-medium text-gray-700">
                랜딩페이지에 노출
              </label>
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
                      <div className="absolute top-2 right-2">
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

