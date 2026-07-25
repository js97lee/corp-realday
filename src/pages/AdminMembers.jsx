import { useState, useEffect, useCallback, useMemo } from 'react'
import { USER_ROLES } from '../utils/auth'
import { fetchMembers, addMember, updateMember, deleteMember } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { formatDateShort } from '../utils/date'
import { ErrorMessage, LoadingSpinner, PageHeader, Button, FormInput, FormSelect, ConfirmDialog } from '../components/common'

function AdminMembers() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: USER_ROLES.PRO,
    name: '',
    profileImageUrl: '',
    joinDate: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  
  // 인증 체크
  useAuth(USER_ROLES.CEO)

  // 멤버 목록 불러오기
  const loadMembers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchMembers()
      if (response.success) {
        // created_at을 createdAt으로 변환
        const formattedMembers = response.members.map(m => ({
          ...m,
          createdAt: m.created_at ? formatDateShort(m.created_at) : formatDateShort(new Date())
        }))
        setMembers(formattedMembers)
      }
    } catch (err) {
      console.error('멤버 목록 불러오기 실패:', err)
      setError(err.message || '멤버 목록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleMemberClick = (member) => {
    setSelectedMember(member)
    setFormData({
      email: member.email,
      password: '',
      role: member.role,
      name: member.name || '',
      profileImageUrl: member.profile_image_url || '',
      joinDate: member.join_date ? formatDateShort(member.join_date) : '',
    })
    setProfileImagePreview(member.profile_image_url || null)
    setIsEditing(true)
    setShowPassword(false)
  }

  const handleAddNew = () => {
    setSelectedMember(null)
    setFormData({
      email: '',
      password: '',
      role: USER_ROLES.PRO,
      name: '',
      profileImageUrl: '',
      joinDate: '',
    })
    setProfileImagePreview(null)
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
          profileImageUrl: formData.profileImageUrl || null,
          joinDate: formData.joinDate || null,
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        
        const response = await updateMember(selectedMember.id, updateData)
        if (response.success) {
          await loadMembers() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedMember(null)
          setFormData({ email: '', password: '', role: USER_ROLES.PRO, name: '', profileImageUrl: '', joinDate: '' })
          setProfileImagePreview(null)
        }
      } else {
        // 추가
        const response = await addMember({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          name: formData.name || null,
          profileImageUrl: formData.profileImageUrl || null,
          joinDate: formData.joinDate || null,
        })
        if (response.success) {
          await loadMembers() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedMember(null)
          setFormData({ email: '', password: '', role: USER_ROLES.PRO, name: '', profileImageUrl: '', joinDate: '' })
          setProfileImagePreview(null)
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
    setFormData({ email: '', password: '', role: USER_ROLES.PRO, name: '', profileImageUrl: '', joinDate: '' })
    setProfileImagePreview(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.')
        return
      }
      
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      
      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result)
        setFormData({ ...formData, profileImageUrl: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteClick = (memberId) => {
    setMemberToDelete(memberId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!memberToDelete) return

    try {
      setLoading(true)
      setError('')
      const response = await deleteMember(memberToDelete)
      if (response.success) {
        await loadMembers() // 목록 다시 불러오기
        if (selectedMember?.id === memberToDelete) {
          setIsEditing(false)
          setSelectedMember(null)
        }
        setShowDeleteConfirm(false)
        setMemberToDelete(null)
      }
    } catch (err) {
      console.error('멤버 삭제 실패:', err)
      setError(err.message || '멤버 삭제에 실패했습니다.')
      setShowDeleteConfirm(false)
      setMemberToDelete(null)
    } finally {
      setLoading(false)
    }
  }, [memberToDelete, selectedMember, loadMembers])

  const getRoleLabel = useCallback((role) => {
    switch (role) {
      case USER_ROLES.CEO:
      case USER_ROLES.SUPER_ADMIN:
        return '최고관리자'
      case USER_ROLES.CTO:
        return 'CTO'
      case USER_ROLES.CMO:
        return 'CMO'
      case USER_ROLES.DIRECTOR:
      case USER_ROLES.MANAGER:
        return 'Director'
      case USER_ROLES.PRO:
      case USER_ROLES.EMPLOYEE:
        return 'Pro'
      case USER_ROLES.PRO1:
        return 'Pro1'
      case USER_ROLES.PRO2:
        return 'Pro2'
      case USER_ROLES.PRO3:
        return 'Pro3'
      default:
        return role
    }
  }, [])

  const getRoleBadgeColor = useCallback((role) => {
    switch (role) {
      case USER_ROLES.CEO:
      case USER_ROLES.SUPER_ADMIN:
        return 'bg-red-100 text-red-800'
      case USER_ROLES.CTO:
      case USER_ROLES.CMO:
        return 'bg-purple-100 text-purple-800'
      case USER_ROLES.DIRECTOR:
      case USER_ROLES.MANAGER:
        return 'bg-blue-100 text-blue-800'
      case USER_ROLES.PRO:
      case USER_ROLES.PRO1:
      case USER_ROLES.PRO2:
      case USER_ROLES.PRO3:
      case USER_ROLES.EMPLOYEE:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const roleOptions = useMemo(() => [
    { value: USER_ROLES.CEO, label: '최고관리자', group: '최고 관리자' },
    { value: USER_ROLES.CTO, label: 'CTO', group: '임원' },
    { value: USER_ROLES.CMO, label: 'CMO', group: '임원' },
    { value: USER_ROLES.DIRECTOR, label: 'Director', group: '중간 관리자' },
    { value: USER_ROLES.PRO, label: 'Pro', group: '직원' },
    { value: USER_ROLES.PRO1, label: 'Pro1', group: '직원' },
    { value: USER_ROLES.PRO2, label: 'Pro2', group: '직원' },
    { value: USER_ROLES.PRO3, label: 'Pro3', group: '직원' },
  ], [])

  return (
    <div className="space-y-4">
      <PageHeader
        title="멤버 관리"
        action={
          !isEditing && (
            <Button onClick={handleAddNew} disabled={loading}>
              새 멤버 추가
            </Button>
          )
        }
      />

      <ErrorMessage message={error} />

      {loading && !isEditing && <LoadingSpinner />}

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-semibold mb-4">
            {selectedMember ? '멤버 수정' : '새 멤버 추가'}
          </h3>

          <div className="space-y-4">
            {/* 프로필 사진 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 사진
              </label>
              <div className="flex items-center gap-4">
                {profileImagePreview && (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="프로필 미리보기"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImagePreview(null)
                        setFormData({ ...formData, profileImageUrl: '' })
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">이미지 파일만 업로드 가능합니다. (최대 5MB)</p>
                </div>
              </div>
            </div>

            <FormInput
              label="이름"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름을 입력하세요"
            />

            <div>
              <FormInput
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                disabled={!!selectedMember}
                required
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

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="역할"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                options={roleOptions.map(opt => ({ value: opt.value, label: opt.label }))}
              />
              <FormInput
                label="입사일"
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                size="lg"
              >
                {loading ? '저장 중...' : '저장'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                variant="secondary"
                size="lg"
              >
                취소
              </Button>
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
                    <div className="flex items-center gap-4 flex-1">
                      {/* 프로필 이미지 */}
                      {member.profile_image_url ? (
                        <img
                          src={member.profile_image_url}
                          alt={member.name || member.email.split('@')[0]}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold flex-shrink-0">
                          {(member.name || member.email.split('@')[0]).charAt(0).toUpperCase()}
                        </div>
                      )}
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
                        <div className="flex items-center gap-4 mt-1">
                          {member.join_date && (
                            <p className="text-xs text-gray-400">
                              입사일: {new Date(member.join_date).toISOString().split('T')[0]}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            가입일: {member.createdAt}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMemberClick(member)
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        수정
                      </Button>
                      {member.email !== 'studio.realday@gmail.com' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(member.id)
                          }}
                          variant="danger"
                          size="sm"
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="멤버 삭제"
        message="정말 이 멤버를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setMemberToDelete(null)
        }}
        variant="danger"
      />
    </div>
  )
}

export default AdminMembers

