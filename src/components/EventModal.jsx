import { useState, useEffect } from 'react'
import { formatDateShort } from '../utils/date'
import { Button, FormInput } from './common'
import { fetchMembers } from '../utils/api'

const EventModal = ({ isOpen, onClose, event, selectedDate, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    color: 'blue',
    is_private: false,
    invited_user_ids: [],
  })
  const [members, setMembers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])

  // 멤버 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadMembers()
    }
  }, [isOpen])

  const loadMembers = async () => {
    try {
      const response = await fetchMembers()
      if (response.success) {
        setMembers(response.members || [])
      }
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error)
    }
  }

  useEffect(() => {
    if (event) {
      const invitedIds = event.invitations 
        ? event.invitations.map(inv => inv.user_id)
        : []
      // event.date가 이미 YYYY-MM-DD 형식 문자열이면 그대로 사용, 아니면 변환
      let eventDateStr = ''
      if (event.date) {
        if (typeof event.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
          // 이미 YYYY-MM-DD 형식이면 그대로 사용
          eventDateStr = event.date
        } else {
          // Date 객체나 다른 형식이면 변환
          eventDateStr = formatDateShort(new Date(event.date))
        }
      }
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: eventDateStr,
        startTime: event.start_time || '',
        endTime: event.end_time || '',
        color: event.color || 'blue',
        is_private: event.is_private || false,
        invited_user_ids: invitedIds,
      })
      setSelectedMembers(invitedIds)
    } else {
      setFormData({
        title: '',
        description: '',
        date: selectedDate ? formatDateShort(selectedDate) : formatDateShort(new Date()),
        startTime: '',
        endTime: '',
        color: 'blue',
        is_private: false,
        invited_user_ids: [],
      })
      setSelectedMembers([])
    }
  }, [event, selectedDate, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.date) {
      alert('제목과 날짜를 입력해주세요.')
      return
    }
    onSave({
      ...formData,
      invited_user_ids: selectedMembers,
    })
  }

  const toggleMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  if (!isOpen) return null

  // 파스텔톤 색상 옵션
  const colorOptions = [
    { value: 'blue', label: '파란색', color: '#A8D5E2' },      // 파스텔 블루
    { value: 'green', label: '초록색', color: '#B5E5CF' },     // 파스텔 그린
    { value: 'red', label: '빨간색', color: '#FFB3BA' },      // 파스텔 레드
    { value: 'yellow', label: '노란색', color: '#FFE5B4' },    // 파스텔 옐로우
    { value: 'purple', label: '보라색', color: '#D4B3FF' },    // 파스텔 퍼플
    { value: 'orange', label: '주황색', color: '#FFD4B3' },    // 파스텔 오렌지
  ]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* 모달 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">
            {event ? '일정 수정' : '일정 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="일정 제목을 입력하세요"
            required
          />

          <FormInput
            label="날짜"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 시간
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                step="900"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 시간
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                step="900"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
              placeholder="일정 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상
            </label>
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: option.value })}
                  className={`
                    w-10 h-10 rounded-full border-2 transition-all
                    ${formData.color === option.value 
                      ? 'border-gray-800 scale-110 shadow-md' 
                      : 'border-gray-300 hover:border-gray-500'
                    }
                  `}
                  style={{ backgroundColor: option.color }}
                  title={option.label}
                >
                  {formData.color === option.value && (
                    <svg 
                      className="w-5 h-5 mx-auto text-gray-800" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 프라이빗/퍼블릭 설정 */}
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                공개 설정
              </label>
              <p className="text-xs text-gray-500">
                {formData.is_private ? '프라이빗: 작성자와 초대받은 사람만 볼 수 있습니다' : '퍼블릭: 모든 사용자가 볼 수 있습니다'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_private: !formData.is_private })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${formData.is_private ? 'bg-gray-800' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${formData.is_private ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* 초대할 사람 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              초대할 사람
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">멤버를 불러올 수 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => {
                    const isSelected = selectedMembers.includes(member.id)
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={`
                          w-full flex items-center gap-2 p-2 rounded-lg transition-colors
                          ${isSelected 
                            ? 'bg-gray-100 border-2 border-gray-800' 
                            : 'bg-white border-2 border-gray-200 hover:border-gray-400'
                          }
                        `}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isSelected ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm flex-1 text-left">
                          {member.name || member.email}
                        </span>
                        {isSelected && (
                          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {selectedMembers.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {selectedMembers.length}명이 초대되었습니다.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
            >
              {event ? '수정' : '추가'}
            </Button>
            {event && (
              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={() => {
                  if (window.confirm('정말 이 일정을 삭제하시겠습니까?')) {
                    onDelete(event.id)
                  }
                }}
              >
                삭제
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onClose}
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal

