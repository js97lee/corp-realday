import { useState, useEffect } from 'react'
import { formatDateShort } from '../utils/date'

const Calendar = ({ events = [], onDateClick, onEventClick, currentUserId }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 달의 첫 번째 날과 마지막 날
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // 달력 그리드 생성
  const calendarDays = []
  
  // 이전 달의 마지막 날들 (빈 칸 채우기)
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    })
  }

  // 현재 달의 날들
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    })
  }

  // 다음 달의 첫 날들 (빈 칸 채우기)
  const remainingDays = 42 - calendarDays.length // 6주 * 7일 = 42
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
    })
  }

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (date) => {
    const dateStr = formatDateShort(date)
    return events.filter(event => {
      const eventDate = formatDateShort(new Date(event.date))
      return eventDate === dateStr
    })
  }

  // 오늘인지 확인
  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-black">
            {year}년 {monthNames[month]}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date)
          const isSelected = selectedDate && formatDateShort(day.date) === formatDateShort(selectedDate)
          
          return (
            <div
              key={index}
              onClick={() => {
                setSelectedDate(day.date)
                if (onDateClick) onDateClick(day.date)
              }}
              className={`
                min-h-[80px] p-1 border border-gray-200 rounded cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
              `}
            >
              <div className={`text-xs mb-1 ${
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isToday(day.date) ? 'font-bold text-blue-600' : ''}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event, eventIndex) => {
                  // 현재 사용자의 초대 상태 확인
                  const userInvitation = event.invitations?.find(inv => inv.user_id === currentUserId)
                  const isDeclined = userInvitation?.status === 'declined'
                  
                  // 파스텔톤 색상 스타일
                  const colorStyles = {
                    blue: { backgroundColor: '#A8D5E2', color: '#2C5F7A' },
                    green: { backgroundColor: '#B5E5CF', color: '#2D6A4F' },
                    red: { backgroundColor: '#FFB3BA', color: '#8B2635' },
                    yellow: { backgroundColor: '#FFE5B4', color: '#8B6914' },
                    purple: { backgroundColor: '#D4B3FF', color: '#5B2C6F' },
                    orange: { backgroundColor: '#FFD4B3', color: '#8B4513' },
                  }
                  const eventColor = event.color || 'blue'
                  
                  // 거절된 일정은 회색 스타일
                  const style = isDeclined 
                    ? { backgroundColor: '#E5E5E5', color: '#9CA3AF' }
                    : (colorStyles[eventColor] || colorStyles.blue)
                  
                  return (
                    <div
                      key={eventIndex}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onEventClick) onEventClick(event)
                      }}
                      className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                        isDeclined ? 'line-through' : ''
                      }`}
                      style={style}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  )
                })}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayEvents.length - 2}개
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar

