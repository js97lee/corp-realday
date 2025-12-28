import { useState, useEffect } from 'react'

const lunchMenus = [
  '한식', '중식', '일식', '양식', '분식', '치킨', '피자', '햄버거',
  '돈까스', '냉면', '국수', '비빔밥', '김밥', '떡볶이', '라면', '파스타',
  '샐러드', '도시락', '삼겹살', '곱창', '족발', '보쌈', '닭갈비', '마라탕'
]

function LunchRoulette({ isOpen, onClose }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [rotation, setRotation] = useState(0)

  const spin = () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setSelectedMenu(null)
    
    // 랜덤 메뉴 선택
    const randomIndex = Math.floor(Math.random() * lunchMenus.length)
    const selected = lunchMenus[randomIndex]
    
    // 각 메뉴는 360/24 = 15도씩 차지
    const segmentAngle = 360 / lunchMenus.length
    // 선택된 메뉴의 중앙 각도 (0도가 위쪽)
    const menuCenterAngle = (randomIndex * segmentAngle) + (segmentAngle / 2)
    
    // 포인터는 위쪽(0도)에 있으므로, 선택된 메뉴가 포인터 위치로 오려면
    // 현재 회전각 + 추가 회전각이 메뉴 중앙을 가리켜야 함
    // 360 - menuCenterAngle을 회전하면 메뉴 중앙이 위쪽(0도)으로 옴
    const targetAngle = 360 - menuCenterAngle
    
    // 최소 5바퀴 이상 회전하도록 (1800도 + 목표 각도)
    const finalRotation = rotation + 1800 + targetAngle
    
    setRotation(finalRotation)
    
    // 회전 애니메이션 시간 (4초)
    setTimeout(() => {
      // 회전이 끝난 후 실제 포인터가 가리키는 메뉴 계산
      const normalizedRotation = finalRotation % 360
      const pointerAngle = (360 - normalizedRotation) % 360
      const calculatedIndex = Math.floor(pointerAngle / segmentAngle) % lunchMenus.length
      const actualSelected = lunchMenus[calculatedIndex]
      
      setSelectedMenu(actualSelected)
      setIsSpinning(false)
    }, 4000)
  }

  useEffect(() => {
    if (!isOpen) {
      setSelectedMenu(null)
      setRotation(0)
      setIsSpinning(false)
    }
  }, [isOpen])

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
      
      {/* 룰렛 팝업 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-black">오늘의 점메추</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 룰렛 */}
        <div className="relative w-full aspect-square mb-6">
          <div 
            className={`w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden ${
              isSpinning ? 'transition-transform duration-[4000ms] ease-out' : ''
            }`}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                ${lunchMenus.map((_, i) => {
                  // 흰색(짝수) - 검정(홀수) 패턴
                  const isWhite = i % 2 === 0
                  return `${isWhite ? '#FFFFFF' : '#000000'} ${(i / lunchMenus.length) * 100}% ${((i + 1) / lunchMenus.length) * 100}%`
                }).join(', ')}
              )`
            }}
          >
            {/* 메뉴 라벨 */}
            {lunchMenus.map((menu, index) => {
              const angle = (360 / lunchMenus.length) * index
              const labelAngle = angle + (360 / lunchMenus.length / 2)
              const radius = 45
              const x = 50 + radius * Math.cos((labelAngle - 90) * Math.PI / 180)
              const y = 50 + radius * Math.sin((labelAngle - 90) * Math.PI / 180)
              
              // 흰색 배경이면 검정 폰트, 검정 배경이면 흰색 폰트
              const isWhite = index % 2 === 0
              const textColor = isWhite ? '#000000' : '#FFFFFF'
              
              return (
                <div
                  key={index}
                  className={`absolute text-xs font-bold ${
                    isSpinning ? 'opacity-80' : 'opacity-100'
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) rotate(${labelAngle}deg)`,
                    transformOrigin: 'center',
                    color: textColor,
                  }}
                >
                  <span style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>
                    {menu}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* 포인터 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>

        {/* 회전 중 표시 */}
        {isSpinning && (
          <div className="text-center mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
            <p className="text-sm text-gray-600">룰렛을 돌리는 중...</p>
          </div>
        )}

        {/* 결과 표시 */}
        {selectedMenu && !isSpinning && (
          <div className="text-center mb-4 animate-fade-in">
            <p className="text-sm text-gray-600 mb-2">오늘의 점심은...</p>
            <p className="text-3xl font-bold text-black">{selectedMenu}</p>
          </div>
        )}

        {/* 스핀 버튼 */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className="w-full px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? '돌리는 중...' : '룰렛 돌리기'}
        </button>
      </div>
    </div>
  )
}

export default LunchRoulette
