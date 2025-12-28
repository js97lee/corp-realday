import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTasks, addTask, updateTask, deleteTask } from '../utils/api'
import { fetchMembers, fetchProjects } from '../utils/api'

// 담당자 Chip 컴포넌트
function AssigneeChip({ name, email, id, onRemove, getAssigneeColor, getAssigneeInitials }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
      <div className={`w-5 h-5 rounded-full ${getAssigneeColor(id || 0)} text-white flex items-center justify-center text-xs font-medium flex-shrink-0`}>
        {getAssigneeInitials(name, email)}
      </div>
      <span className="text-gray-700">{name || email}</span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(name || email)}
          className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

// 담당자 선택 컴포넌트 (다중 선택 가능, Chip UI)
function AssigneeSelector({ members, selectedNames = [], onChange, onAddMember }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [filteredMembers, setFilteredMembers] = useState(members)
  const [showNewOption, setShowNewOption] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (inputValue.startsWith('@')) {
      const searchTerm = inputValue.substring(1).toLowerCase()
      if (searchTerm) {
        const filtered = members.filter(m => {
          const name = (m.name || m.email).toLowerCase()
          return name.includes(searchTerm) && !selectedNames.includes(m.name || m.email)
        })
        setFilteredMembers(filtered)
        setShowNewOption(!filtered.some(m => (m.name || m.email).toLowerCase() === searchTerm))
      } else {
        setFilteredMembers(members.filter(m => !selectedNames.includes(m.name || m.email)))
        setShowNewOption(false)
      }
      setIsOpen(true)
    } else if (inputValue) {
      const filtered = members.filter(m => {
        const name = (m.name || m.email).toLowerCase()
        return name.includes(inputValue.toLowerCase()) && !selectedNames.includes(m.name || m.email)
      })
      setFilteredMembers(filtered)
      setShowNewOption(false)
      setIsOpen(true)
    } else {
      setFilteredMembers(members.filter(m => !selectedNames.includes(m.name || m.email)))
      setIsOpen(false)
    }
  }, [inputValue, members, selectedNames])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
  }

  const handleSelectMember = (member) => {
    const name = member.name || member.email
    if (!selectedNames.includes(name)) {
      onChange([...selectedNames, name])
    }
    setInputValue('')
    setIsOpen(false)
  }

  const handleAddNew = () => {
    const newName = inputValue.startsWith('@') ? inputValue.substring(1) : inputValue
    if (newName.trim() && !selectedNames.includes(newName.trim())) {
      onChange([...selectedNames, newName.trim()])
      onAddMember(newName.trim())
      setInputValue('')
      setIsOpen(false)
    }
  }

  const getAssigneeColor = (id) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500']
    return colors[id % colors.length] || 'bg-gray-500'
  }

  const getAssigneeInitials = (name, email) => {
    if (name) {
      const parts = name.split(' ')
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="min-h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent outline-none flex flex-wrap gap-2 items-center">
        {selectedNames.map((name) => {
          const member = members.find(m => (m.name || m.email) === name)
          return (
            <AssigneeChip
              key={name}
              name={member?.name}
              email={member?.email || name}
              id={member?.id}
              onRemove={(nameToRemove) => {
                onChange(selectedNames.filter(n => n !== nameToRemove))
              }}
              getAssigneeColor={getAssigneeColor}
              getAssigneeInitials={getAssigneeInitials}
            />
          )
        })}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedNames.length === 0 ? "@로 검색하거나 새 담당자 추가" : "담당자 추가..."}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
        />
      </div>
      {isOpen && (filteredMembers.length > 0 || showNewOption) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredMembers.map((member) => {
            const name = member.name || member.email
            return (
              <div
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
              >
                <div className={`w-6 h-6 rounded-full ${getAssigneeColor(member.id)} text-white flex items-center justify-center text-xs font-medium`}>
                  {getAssigneeInitials(member.name, member.email)}
                </div>
                <span className="text-sm">{name}</span>
              </div>
            )
          })}
          {showNewOption && inputValue.startsWith('@') && inputValue.length > 1 && (
            <div
              onClick={handleAddNew}
              className="px-4 py-2 hover:bg-green-50 cursor-pointer flex items-center gap-2 border-t border-gray-200"
            >
              <span className="text-green-600 text-sm">+ 새 담당자 추가: {inputValue.substring(1)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AdminTasks() {
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMyTasks, setFilterMyTasks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeIds: [],
    assigneeNames: [],
    priority: 'medium',
    status: 'backlog',
    projectId: '',
    projectKey: 'APP',
    startDate: '',
    endDate: '',
  })
  const [draggedTask, setDraggedTask] = useState(null)
  const navigate = useNavigate()

  // 현재 로그인한 사용자 정보
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // 업무 목록 불러오기
  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetchTasks()
      if (response.success) {
        setTasks(response.tasks || [])
      }
    } catch (err) {
      console.error('업무 목록 불러오기 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  // 멤버 목록 불러오기
  const loadMembers = async () => {
    try {
      const response = await fetchMembers()
      if (response.success) {
        setMembers(response.members || [])
      }
    } catch (err) {
      console.error('멤버 목록 불러오기 실패:', err)
    }
  }

  // 프로젝트 목록 불러오기
  const loadProjects = async () => {
    try {
      const response = await fetchProjects(false) // 관리자용: 모든 프로젝트
      if (response.success) {
        setProjects(response.projects || [])
      }
    } catch (err) {
      console.error('프로젝트 목록 불러오기 실패:', err)
    }
  }

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/admin')
      return
    }

    loadTasks()
    loadMembers()
    loadProjects()
  }, [navigate])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && (isAdding || selectedTask)) {
        setIsAdding(false)
        setSelectedTask(null)
        setFormData({ title: '', description: '', assigneeIds: [], assigneeNames: [], priority: 'medium', status: 'backlog', projectId: '', projectKey: 'APP', startDate: '', endDate: '' })
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isAdding, selectedTask])

  // 필터링된 업무 업데이트
  useEffect(() => {
    let filtered = tasks

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.task_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // 내 업무만 필터
    if (filterMyTasks && currentUser.id) {
      filtered = filtered.filter(task => task.assignee_id === currentUser.id)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchQuery, filterMyTasks, currentUser.id])

  // 컬럼별로 업무 분류
  const columns = [
    { id: 'backlog', title: '백로그', count: 0 },
    { id: 'selected', title: '개발하기로 선택된', count: 0 },
    { id: 'inProgress', title: '진행 중', count: 0 },
    { id: 'done', title: '완료', count: 0 },
  ]

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => {
      if (status === 'backlog') return task.status === 'backlog'
      if (status === 'selected') return task.status === 'selected'
      if (status === 'inProgress') return task.status === 'inProgress'
      if (status === 'done') return task.status === 'done'
      return false
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = selectedTask
        ? await updateTask(selectedTask.id, formData)
        : await addTask(formData)
      
      if (response.success) {
        await loadTasks()
        setIsAdding(false)
        setSelectedTask(null)
        setFormData({ title: '', description: '', assigneeIds: [], assigneeNames: [], priority: 'medium', status: 'backlog', projectId: '', projectKey: 'APP', startDate: '', endDate: '' })
      }
    } catch (err) {
      console.error('업무 저장 실패:', err)
      alert(err.message || '업무 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('정말 이 업무를 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)
      const response = await deleteTask(taskId)
      if (response.success) {
        await loadTasks()
        if (selectedTask?.id === taskId) {
          setSelectedTask(null)
          setIsAdding(false)
        }
      }
    } catch (err) {
      console.error('업무 삭제 실패:', err)
      alert(err.message || '업무 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (targetStatus) => {
    if (!draggedTask) return

    if (draggedTask.status === targetStatus) {
      setDraggedTask(null)
      return
    }

    try {
      setLoading(true)
      const response = await updateTask(draggedTask.id, { status: targetStatus })
      if (response.success) {
        await loadTasks()
      }
    } catch (err) {
      console.error('업무 상태 변경 실패:', err)
      alert(err.message || '업무 상태 변경에 실패했습니다.')
    } finally {
      setDraggedTask(null)
      setLoading(false)
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'highest':
        // 화살표 두개 위쪽
        return (
          <div className="flex items-center gap-0.5">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'high':
        // 화살표 한개 위쪽
        return (
          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'medium':
        // 대시(-)
        return (
          <span className="text-gray-600 font-medium">-</span>
        )
      case 'low':
        // 화살표 한개 아래쪽 (파란색)
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'lowest':
        // 화살표 두개 아래쪽 (파란색)
        return (
          <div className="flex items-center gap-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const getAssigneeInitials = (name, email) => {
    if (name) {
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return '??'
  }

  const getAssigneeColor = (id) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500']
    return colors[id % colors.length] || 'bg-gray-500'
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">칸반 보드</h2>
        {!isAdding && !selectedTask && (
          <button
            onClick={() => {
              setIsAdding(true)
              setFormData({ title: '', description: '', assigneeIds: [], assigneeNames: [], priority: 'medium', status: 'backlog', projectId: '', projectKey: 'APP', startDate: '', endDate: '' })
            }}
            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
          >
            항목 추가
          </button>
        )}
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterMyTasks}
              onChange={(e) => setFilterMyTasks(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">내 이슈만</span>
          </label>
          <div className="flex items-center gap-2">
            {members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className={`w-8 h-8 rounded-full ${getAssigneeColor(member.id)} text-white flex items-center justify-center text-xs font-medium`}
                title={member.name || member.email}
              >
                {getAssigneeInitials(member.name, member.email)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 업무 추가/수정 모달 */}
      {(isAdding || selectedTask) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAdding(false)
              setSelectedTask(null)
              setFormData({ title: '', description: '', assigneeIds: [], assigneeNames: [], priority: 'medium', status: 'backlog', projectId: '', projectKey: 'APP', startDate: '', endDate: '' })
            }
          }}
        >
          {/* 딤 배경 */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          
          {/* 모달 컨텐츠 */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold">
                {selectedTask ? '업무 수정' : '새 업무 추가'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setSelectedTask(null)
                  setFormData({ title: '', description: '', assigneeIds: [], assigneeNames: [], priority: 'medium', status: 'backlog', projectId: '', projectKey: 'APP', startDate: '', endDate: '' })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="닫기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 왼쪽 컬럼: 제목, 설명 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="업무 제목"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="8"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="업무 설명"
                    />
                  </div>
                </div>

                {/* 오른쪽 컬럼: 담당자, 일정, 연관 프로젝트, 우선순위 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                    <AssigneeSelector
                      members={members}
                      selectedNames={formData.assigneeNames || []}
                      onChange={(names) => {
                        const memberIds = names.map(name => {
                          const member = members.find(m => (m.name || m.email) === name)
                          return member ? member.id : null
                        }).filter(id => id !== null)
                        setFormData({
                          ...formData,
                          assigneeIds: memberIds,
                          assigneeNames: names
                        })
                      }}
                      onAddMember={(name) => {
                        // 새 담당자 추가
                        const currentNames = formData.assigneeNames || []
                        if (!currentNames.includes(name)) {
                          setFormData({
                            ...formData,
                            assigneeNames: [...currentNames, name]
                          })
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">일정</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">시작일</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">종료일</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">연관 프로젝트</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => {
                        const selectedProjectId = e.target.value
                        const selectedProject = projects.find(p => p.id.toString() === selectedProjectId)
                        setFormData({ 
                          ...formData, 
                          projectId: selectedProjectId,
                          projectKey: selectedProject ? (selectedProject.project_key || 'APP') : 'APP'
                        })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">프로젝트 선택 (선택사항)</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title} {project.project_key ? `(${project.project_key})` : ''}
                        </option>
                      ))}
                    </select>
                    {formData.projectId && (
                      <p className="text-xs text-gray-500 mt-1">
                        선택한 프로젝트의 키: <span className="font-medium">{formData.projectKey || 'APP'}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="lowest">가장 낮음</option>
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="highest">가장 높음</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 상태 선택 (새 업무 추가 시에만 표시) */}
              {!selectedTask && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="backlog">백로그</option>
                    <option value="selected">개발하기로 선택된</option>
                    <option value="inProgress">진행 중</option>
                    <option value="review">검토</option>
                    <option value="done">완료</option>
                  </select>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex gap-4">
                  {selectedTask && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedTask.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false)
                      setSelectedTask(null)
                      setFormData({ title: '', description: '', assigneeIds: [], assigneeNames: [], priority: 'medium', status: 'backlog', projectId: '', projectKey: 'APP', startDate: '', endDate: '' })
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg"
                  >
                    취소
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 칸반 보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          return (
            <div
              key={column.id}
              className="bg-white rounded-lg border border-gray-200 min-h-[600px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h3 className="font-semibold text-base text-gray-700">
                  {column.title} {columnTasks.length}
                </h3>
              </div>
              <div className="p-3 space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => {
                      setSelectedTask(task)
                      setIsAdding(false)
                      setFormData({
                        title: task.title,
                        description: task.description || '',
                        assigneeIds: task.assignee_id ? [task.assignee_id] : [],
                        assigneeNames: task.assignee_name ? [task.assignee_name] : [],
                        priority: task.priority || 'medium',
                        status: task.status || 'backlog',
                        projectId: task.project_id || '',
                        projectKey: task.project_key || 'APP',
                        startDate: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '',
                        endDate: task.end_date ? new Date(task.end_date).toISOString().split('T')[0] : '',
                      })
                    }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-move hover:shadow-md transition-all hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs font-medium text-gray-500">{task.task_key}</span>
                      </div>
                      {getPriorityIcon(task.priority)}
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    {task.assignee_name && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-6 h-6 rounded-full ${getAssigneeColor(task.assignee_id || 0)} text-white flex items-center justify-center text-xs font-medium`}>
                          {getAssigneeInitials(task.assignee_name, task.assignee_email)}
                        </div>
                        <span className="text-xs text-gray-500">{task.assignee_name}</span>
                      </div>
                    )}
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    {column.id === 'done' ? '최근에 수정된 이슈만 표시하고 있습니다.' : '업무가 없습니다'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminTasks
