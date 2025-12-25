import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserRole, USER_ROLES } from '../utils/auth'

function AdminMembers() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: USER_ROLES.EMPLOYEE,
    name: '',
  })
  const navigate = useNavigate()
  const userRole = getUserRole()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/admin')
      return
    }

    // 최고관리자만 접근 가능
    if (userRole !== USER_ROLES.SUPER_ADMIN) {
      navigate('/admin/dashboard')
      return
    }

    // 현재 로그인한 사용자 정보 가져오기
    const currentUserData = localStorage.getItem('user')
    let currentUser = null
    if (currentUserData) {
      try {
        currentUser = JSON.parse(currentUserData)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }

    // 임시 멤버 데이터 (실제로는 API에서 가져옴)
    const initialMembers = [
      {
        id: 1,
        email: 'studio.realday@gmail.com',
        name: '최고관리자',
        role: USER_ROLES.SUPER_ADMIN,
        createdAt: '2024-01-01',
      },
      {
        id: 2,
        email: 'manager@real-day.com',
        name: '중간관리자',
        role: USER_ROLES.MANAGER,
        createdAt: '2024-01-15',
      },
      {
        id: 3,
        email: 'employee@real-day.com',
        name: '직원',
        role: USER_ROLES.EMPLOYEE,
        createdAt: '2024-02-01',
      },
    ]

    // 현재 로그인한 사용자가 목록에 없으면 추가
    if (currentUser && currentUser.email) {
      const exists = initialMembers.some(m => m.email === currentUser.email)
      if (!exists) {
        initialMembers.push({
          id: initialMembers.length + 1,
          email: currentUser.email,
          name: currentUser.name || currentUser.email.split('@')[0],
          role: currentUser.role || USER_ROLES.SUPER_ADMIN,
          createdAt: new Date().toISOString().split('T')[0],
        })
      }
    }

    setMembers(initialMembers)
  }, [navigate, userRole])

  const handleMemberClick = (member) => {
    setSelectedMember(member)
    setFormData({
      email: member.email,
      password: '', // 비밀번호는 수정 시에만 입력
      role: member.role,
      name: member.name || '',
    })
    setIsEditing(true)
  }

  const handleAddNew = () => {
    setSelectedMember(null)
    setFormData({
      email: '',
      password: '',
      role: USER_ROLES.EMPLOYEE,
      name: '',
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!formData.email || (!selectedMember && !formData.password)) {
      alert('이메일과 비밀번호를 입력해주세요.')
      return
    }

    if (selectedMember) {
      // 수정
      setMembers(
        members.map((m) =>
          m.id === selectedMember.id
            ? {
                ...m,
                email: formData.email,
                role: formData.role,
                name: formData.name,
                ...(formData.password && { password: formData.password }),
              }
            : m
        )
      )
    } else {
      // 추가
      const newMember = {
        id: members.length + 1,
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        role: formData.role,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setMembers([...members, newMember])
    }

    setIsEditing(false)
    setSelectedMember(null)
    setFormData({ email: '', password: '', role: USER_ROLES.EMPLOYEE, name: '' })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedMember(null)
    setFormData({ email: '', password: '', role: USER_ROLES.EMPLOYEE, name: '' })
  }

  const handleDelete = (memberId) => {
    if (window.confirm('정말 이 멤버를 삭제하시겠습니까?')) {
      setMembers(members.filter((m) => m.id !== memberId))
      if (selectedMember?.id === memberId) {
        setIsEditing(false)
        setSelectedMember(null)
      }
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return '최고관리자'
      case USER_ROLES.MANAGER:
        return '중간관리자'
      case USER_ROLES.EMPLOYEE:
        return '직원'
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return 'bg-red-100 text-red-800'
      case USER_ROLES.MANAGER:
        return 'bg-blue-100 text-blue-800'
      case USER_ROLES.EMPLOYEE:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (userRole !== USER_ROLES.SUPER_ADMIN) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">멤버 관리</h2>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
          >
            새 멤버 추가
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-semibold mb-4">
            {selectedMember ? '멤버 수정' : '새 멤버 추가'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="email@example.com"
                disabled={!!selectedMember} // 수정 시 이메일 변경 불가
              />
              {selectedMember && (
                <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedMember ? '새 비밀번호 (변경 시에만 입력)' : '비밀번호 *'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                역할 *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
              >
                <option value={USER_ROLES.EMPLOYEE}>직원</option>
                <option value={USER_ROLES.MANAGER}>중간관리자</option>
                <option value={USER_ROLES.SUPER_ADMIN}>최고관리자</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold">멤버 목록</h3>
          </div>
          <div className="p-4">
            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-8">멤버가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleMemberClick(member)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {member.name || member.email.split('@')[0]}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        가입일: {member.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMemberClick(member)
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg"
                      >
                        수정
                      </button>
                      {member.email !== 'studio.realday@gmail.com' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(member.id)
                          }}
                          className="px-3 py-1 text-sm bg-red-500 text-white font-medium hover:bg-red-600 transition-colors rounded-lg"
                        >
                          삭제
                        </button>
                      )}
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

export default AdminMembers

