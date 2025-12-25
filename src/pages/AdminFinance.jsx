import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSuperAdmin } from '../utils/auth'

function AdminFinance() {
  const [financeData, setFinanceData] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
    type: 'expense', // income or expense
  })
  const navigate = useNavigate()

  useEffect(() => {
    // 권한 확인
    if (!isSuperAdmin()) {
      navigate('/admin/dashboard')
      return
    }

    // 임시 재무 데이터
    setFinanceData([
      {
        id: 1,
        date: '2024-01-15',
        category: '인건비',
        description: '월급',
        amount: 5000000,
        type: 'expense',
      },
      {
        id: 2,
        date: '2024-01-20',
        category: '수익',
        description: '프로젝트 수주',
        amount: 10000000,
        type: 'income',
      },
    ])
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    const newItem = {
      id: financeData.length + 1,
      ...formData,
      amount: parseFloat(formData.amount),
    }
    setFinanceData([...financeData, newItem])
    setIsAdding(false)
    setFormData({ date: '', category: '', description: '', amount: '', type: 'expense' })
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

      {/* 항목 추가 폼 */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">항목 추가</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                >
                  <option value="income">수익</option>
                  <option value="expense">지출</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
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
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="항목 설명"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">금액</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="금액 입력"
              />
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
                  setFormData({ date: '', category: '', description: '', amount: '', type: 'expense' })
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors rounded-lg"
              >
                취소
              </button>
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
          {financeData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">재무 내역이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {financeData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
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
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <p className={`text-lg font-semibold ${
                    item.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminFinance


