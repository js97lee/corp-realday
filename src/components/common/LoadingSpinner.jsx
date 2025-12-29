/**
 * 공통 로딩 스피너 컴포넌트
 */
function LoadingSpinner({ message = '로딩 중...', className = '' }) {
  return (
    <div className={`text-center py-4 text-gray-500 ${className}`}>
      {message}
    </div>
  )
}

export default LoadingSpinner


