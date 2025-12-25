import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminTasks() {
  const [tasks, setTasks] = useState({
    planned: [],
    inProgress: [],
    completed: [],
    onHold: [],
  })
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
  })
  const [draggedTask, setDraggedTask] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/admin')
      return
    }

    // 임시 업무 데이터
    setTasks({
      planned: [
        { id: 1, title: '새 프로젝트 기획', description: '프로젝트 기획서 작성', assignee: '홍길동', priority: 'high' },
        { id: 2, title: '디자인 작업', description: 'UI/UX 디자인', assignee: '김철수', priority: 'medium' },
      ],
      inProgress: [
        { id: 3, title: '개발 작업', description: '프론트엔드 개발', assignee: '이영희', priority: 'high' },
      ],
      completed: [
        { id: 4, title: '테스트 완료', description: 'QA 테스트 완료', assignee: '박민수', priority: 'low' },
      ],
      onHold: [],
    })
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    const newTask = {
      id: Date.now(),
      ...formData,
    }
    setTasks({
      ...tasks,
      planned: [...tasks.planned, newTask],
    })
    setIsAdding(false)
    setFormData({ title: '', description: '', assignee: '', priority: 'medium' })
  }

  const handleDragStart = (task, status) => {
    setDraggedTask({ task, status })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (targetStatus) => {
    if (!draggedTask) return

    const { task, status: sourceStatus } = draggedTask

    if (sourceStatus === targetStatus) {
      setDraggedTask(null)
      return
    }

    // 원래 상태에서 제거
    const updatedTasks = { ...tasks }
    updatedTasks[sourceStatus] = updatedTasks[sourceStatus].filter(t => t.id !== task.id)
    
    // 새 상태에 추가
    updatedTasks[targetStatus] = [...updatedTasks[targetStatus], task]

    setTasks(updatedTasks)
    setDraggedTask(null)
  }

  const columns = [
    { id: 'planned', title: '예정', color: 'bg-blue-50 border-blue-200' },
    { id: 'inProgress', title: '진행중', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'completed', title: '완료', color: 'bg-green-50 border-green-200' },
    { id: 'onHold', title: '보류', color: 'bg-gray-50 border-gray-200' },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return '높음'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return '보통'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">업무 진행상황</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
          >
            업무 추가
          </button>
        )}
      </div>

      {/* 업무 추가 폼 */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">새 업무 추가</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="업무 제목"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                placeholder="업무 설명"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="담당자 이름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setFormData({ title: '', description: '', assignee: '', priority: 'medium' })
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 칸반 보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`${column.color} border-2 rounded-lg p-4 min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <h3 className="font-semibold text-lg mb-4 text-center">{column.title}</h3>
            <div className="space-y-3">
              {tasks[column.id].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                  className="bg-white rounded-lg shadow p-3 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm flex-1">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                  {task.assignee && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {task.assignee}
                    </div>
                  )}
                </div>
              ))}
              {tasks[column.id].length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  업무가 없습니다
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminTasks


