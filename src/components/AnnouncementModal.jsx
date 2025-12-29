import { useState, useEffect } from 'react'
import { Button, FormInput } from './common'

const AnnouncementModal = ({ isOpen, onClose, announcement, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true,
  })

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        is_active: announcement.is_active !== false,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        is_active: true,
      })
    }
  }, [announcement, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.')
      return
    }
    onSave(formData)
  }

  if (!isOpen) return null

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
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">
            {announcement ? '공지사항 수정' : '공지사항 작성'}
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
            placeholder="공지사항 제목을 입력하세요"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
              placeholder="공지사항 내용을 입력하세요"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              활성화 (활성화된 공지사항만 대시보드에 표시됩니다)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
            >
              {announcement ? '수정' : '작성'}
            </Button>
            {announcement && (
              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={() => {
                  if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
                    onDelete(announcement.id)
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

export default AnnouncementModal


