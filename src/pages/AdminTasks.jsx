import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTasks, addTask, updateTask, deleteTask } from '../utils/api'
import { fetchMembers } from '../utils/api'

function AdminTasks() {
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMyTasks, setFilterMyTasks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    assigneeName: '',
    priority: 'medium',
    status: 'backlog',
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

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/admin')
      return
    }

    loadTasks()
    loadMembers()
  }, [navigate])

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
        setFormData({ title: '', description: '', assigneeId: '', assigneeName: '', priority: 'medium', status: 'backlog' })
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
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'high':
        return (
          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'low':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'lowest':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
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
              setFormData({ title: '', description: '', assigneeId: '', assigneeName: '', priority: 'medium', status: 'backlog' })
            }}
            className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors rounded-lg"
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

      {/* 업무 추가/수정 폼 */}
      {(isAdding || selectedTask) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedTask ? '업무 수정' : '새 업무 추가'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="업무 설명"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => {
                    const member = members.find(m => m.id === parseInt(e.target.value))
                    setFormData({
                      ...formData,
                      assigneeId: e.target.value,
                      assigneeName: member ? (member.name || member.email) : ''
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">담당자 선택</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
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
            {!selectedTask && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="backlog">백로그</option>
                  <option value="selected">개발하기로 선택된</option>
                  <option value="inProgress">진행 중</option>
                  <option value="done">완료</option>
                </select>
              </div>
            )}
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
                  setFormData({ title: '', description: '', assigneeId: '', assigneeName: '', priority: 'medium', status: 'backlog' })
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg"
              >
                취소
              </button>
              {selectedTask && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedTask.id)}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  삭제
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 칸반 보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          return (
            <div
              key={column.id}
              className="bg-gray-50 rounded-lg border border-gray-200 min-h-[600px]"
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
                        assigneeId: task.assignee_id || '',
                        assigneeName: task.assignee_name || '',
                        priority: task.priority || 'medium',
                        status: task.status || 'backlog',
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
