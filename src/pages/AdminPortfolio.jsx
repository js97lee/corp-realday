import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPortfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } from '../utils/api'

function AdminPortfolio() {
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    description: '',
    displayOrder: 0,
  })
  const navigate = useNavigate()

  // 포트폴리오 항목 목록 불러오기
  const loadItems = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchPortfolioItems()
      if (response.success) {
        setItems(response.items || [])
      }
    } catch (err) {
      console.error('포트폴리오 항목 목록 불러오기 실패:', err)
      setError(err.message || '포트폴리오 항목 목록을 불러올 수 없습니다.')
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

    // 포트폴리오 항목 목록 불러오기
    loadItems()
  }, [navigate])

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setFormData({
      number: item.number || '',
      title: item.title || '',
      description: item.description || '',
      displayOrder: item.display_order || 0,
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert('제목과 설명을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')

      if (selectedItem) {
        // 항목 수정
        const response = await updatePortfolioItem(selectedItem.id, formData)
        if (response.success) {
          await loadItems() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedItem(null)
          setFormData({ number: '', title: '', description: '', displayOrder: 0 })
        }
      } else {
        // 새 항목 추가
        const response = await addPortfolioItem(formData)
        if (response.success) {
          await loadItems() // 목록 다시 불러오기
          setIsEditing(false)
          setSelectedItem(null)
          setFormData({ number: '', title: '', description: '', displayOrder: 0 })
        }
      }
    } catch (err) {
      console.error('포트폴리오 항목 저장 실패:', err)
      setError(err.message || '포트폴리오 항목 저장에 실패했습니다.')
      alert(err.message || '포트폴리오 항목 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('정말 이 항목을 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)
      const response = await deletePortfolioItem(itemId)
      if (response.success) {
        await loadItems() // 목록 다시 불러오기
        if (selectedItem?.id === itemId) {
          setIsEditing(false)
          setSelectedItem(null)
        }
      }
    } catch (err) {
      console.error('포트폴리오 항목 삭제 실패:', err)
      alert(err.message || '포트폴리오 항목 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedItem(null)
    setFormData({ number: '', title: '', description: '', displayOrder: 0 })
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">포트폴리오 관리</h2>
        {!isEditing && (
          <button
            onClick={() => {
              setSelectedItem(null)
              setFormData({ number: '', title: '', description: '', displayOrder: 0 })
              setIsEditing(true)
            }}
            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
            disabled={loading}
          >
            항목 추가
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

      {/* 편집 폼 */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedItem ? '포트폴리오 항목 수정' : '새 포트폴리오 항목 추가'}
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">번호</label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">표시 순서</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="포트폴리오 항목 제목"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                placeholder="포트폴리오 항목 설명"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              {selectedItem && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedItem.id)}
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

      {/* 항목 목록 */}
      {!isEditing && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold">포트폴리오 항목 목록</h3>
          </div>
          <div className="p-4">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">포트폴리오 항목이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="text-xl font-medium text-black">
                          {String(item.number || 0).padStart(2, '0')}
                        </div>
                        <div className="w-8 h-px bg-black mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        <div className="mt-2 text-xs text-gray-400">
                          표시 순서: {item.display_order}
                        </div>
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

export default AdminPortfolio

