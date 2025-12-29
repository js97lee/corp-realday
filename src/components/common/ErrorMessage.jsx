/**
 * 공통 에러 메시지 컴포넌트
 */
function ErrorMessage({ message, className = '' }) {
  if (!message) return null

  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm ${className}`}>
      {message}
    </div>
  )
}

export default ErrorMessage


