/**
 * 공통 페이지 헤더 컴포넌트
 */
function PageHeader({ title, action, children }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      {action && <div>{action}</div>}
      {children}
    </div>
  )
}

export default PageHeader



