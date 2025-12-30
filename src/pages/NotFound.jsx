import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-8">요청하신 페이지가 존재하지 않습니다.</p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            홈으로 가기
          </Link>
          <Link
            to="/admin"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            어드민 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound

