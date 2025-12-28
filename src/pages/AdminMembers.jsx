import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserRole, USER_ROLES } from '../utils/auth'
import { fetchMembers, addMember, updateMember, deleteMember } from '../utils/api'

function AdminMembers() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: USER_ROLES.EMPLOYEE,
    name: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const userRole = getUserRole()

  // 멤버 목록 불러오기
  const loadMembers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchMembers()
      if (response.success) {
        // created_at을 createdAt으로 변환
        const formattedMembers = response.members.map(m => ({
          ...m,
          createdAt: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }))
        setMembers(formattedMembers)
      }
    } catch (err) {
      console.error('멤버 목록 불러오기 실패:', err)
      setError(err.message || '멤버 목록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

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

    // 멤버 목록 불러오기
    loadMembers()
  }, [navigate, userRole])

  const handleMemberClick = (member) => {
    setSelectedMember(member)
    setFormData({
      email: member.email,
      password: member.password || '', // 현재 비밀번호 표시
      role: member.role,
      name: member.name || '',
    })
    setIsEditing(true)
    setShowPassword(true) // 수정 시 비밀번호 표시
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

  const handleSave = async () => {
    if (!formData.email || (!selectedMember && !formData.password)) {
      alert('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')

      if (selectedMember) {
        // 수정
        const updateData = {
          role: formData.role,
          name: formData.name || null,
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        
        const response = await updateMember(selectedMember.id, updateData)
        if (response.success) {
          await loadMembers() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedMember(null)
          setFormData({ email: '', password: '', role: USER_ROLES.EMPLOYEE, name: '' })
        }
      } else {
        // 추가
        const response = await addMember({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          name: formData.name || null,
        })
        if (response.success) {
          await loadMembers() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedMember(null)
          setFormData({ email: '', password: '', role: USER_ROLES.EMPLOYEE, name: '' })
        }
      }
    } catch (err) {
      console.error('멤버 저장 실패:', err)
      setError(err.message || '멤버 저장에 실패했습니다.')
      alert(err.message || '멤버 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedMember(null)
    setFormData({ email: '', password: '', role: USER_ROLES.EMPLOYEE, name: '' })
  }

  const handleDelete = async (memberId) => {
    if (!window.confirm('정말 이 멤버를 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await deleteMember(memberId)
      if (response.success) {
        await loadMembers() // 목록 다시 불러오기
        if (selectedMember?.id === memberId) {
          setIsEditing(false)
          setSelectedMember(null)
        }
      }
    } catch (err) {
      console.error('멤버 삭제 실패:', err)
      setError(err.message || '멤버 삭제에 실패했습니다.')
      alert(err.message || '멤버 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
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
            disabled={loading}
          >
            새 멤버 추가
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
                      {member.password && (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">비밀번호:</p>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">
                            {member.password}
                          </code>
                        </div>
                      )}
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

