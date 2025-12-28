import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSuperAdmin } from '../utils/auth'
import { fetchFinances, addFinance, updateFinance, deleteFinance } from '../utils/api'

function AdminFinance() {
  const [financeData, setFinanceData] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [selectedFinance, setSelectedFinance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
    type: 'expense', // income or expense
    paymentMethod: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    // 권한 확인
    if (!isSuperAdmin()) {
      navigate('/admin/dashboard')
      return
    }

    loadFinances()
  }, [navigate])

  const loadFinances = async () => {
    try {
      setLoading(true)
      const response = await fetchFinances()
      if (response.success) {
        setFinanceData(response.finances || [])
      }
    } catch (error) {
      console.error('재무 내역 불러오기 실패:', error)
      alert(error.message || '재무 내역을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const financePayload = {
        date: formData.date,
        category: formData.category,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        type: formData.type,
        paymentMethod: formData.paymentMethod || null,
      }

      if (selectedFinance) {
        // 수정
        const response = await updateFinance(selectedFinance.id, financePayload)
        if (response.success) {
          alert('재무 내역이 수정되었습니다.')
          await loadFinances()
          handleCancel()
        }
      } else {
        // 추가
        const response = await addFinance(financePayload)
        if (response.success) {
          alert('재무 내역이 추가되었습니다.')
          await loadFinances()
          handleCancel()
        }
      }
    } catch (error) {
      console.error('재무 내역 저장 실패:', error)
      alert(error.message || '재무 내역 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (finance) => {
    setSelectedFinance(finance)
    setFormData({
      date: finance.date,
      category: finance.category,
      description: finance.description || '',
      amount: finance.amount.toString(),
      type: finance.type,
      paymentMethod: finance.payment_method || '',
    })
    setIsAdding(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 재무 내역을 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)
      const response = await deleteFinance(id)
      if (response.success) {
        alert('재무 내역이 삭제되었습니다.')
        await loadFinances()
      }
    } catch (error) {
      console.error('재무 내역 삭제 실패:', error)
      alert(error.message || '재무 내역 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setSelectedFinance(null)
    setFormData({ date: '', category: '', description: '', amount: '', type: 'expense', paymentMethod: '' })
  }

  const totalIncome = financeData
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalExpense = financeData
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">재무 관리</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
          >
            항목 추가
          </button>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">총 수익</p>
          <p className="text-2xl font-bold text-green-600">
            {totalIncome.toLocaleString()}원
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">총 지출</p>
          <p className="text-2xl font-bold text-red-600">
            {totalExpense.toLocaleString()}원
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">잔액</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 항목 추가/수정 폼 */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedFinance ? '항목 수정' : '항목 추가'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">유형 *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                >
                  <option value="income">수익</option>
                  <option value="expense">지출</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜 *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="예: 인건비, 마케팅 등"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="항목 설명"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">금액 *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="금액 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">결제 수단</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                >
                  <option value="">선택 안 함</option>
                  <option value="cash">현금</option>
                  <option value="card">카드</option>
                  <option value="transfer">계좌이체</option>
                  <option value="check">수표</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : (selectedFinance ? '수정' : '추가')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              {selectedFinance && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedFinance.id)}
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

      {/* 재무 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold">재무 내역</h3>
        </div>
        <div className="p-4">
          {loading && financeData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : financeData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">재무 내역이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {financeData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEdit(item)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        item.type === 'income' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.type === 'income' ? '수익' : '지출'}
                      </span>
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                      {item.payment_method && (
                        <span className="text-xs text-gray-400">
                          ({getPaymentMethodLabel(item.payment_method)})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{item.description || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-lg font-semibold ${
                      item.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()}원
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 결제 수단 라벨 변환 함수
function getPaymentMethodLabel(method) {
  const labels = {
    cash: '현금',
    card: '카드',
    transfer: '계좌이체',
    check: '수표',
    other: '기타',
  }
  return labels[method] || method
}
    </div>
  )
}

export default AdminFinance




