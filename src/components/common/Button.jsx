/**
 * 공통 버튼 컴포넌트
 */
function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // primary, secondary, danger
  size = 'md', // sm, md, lg
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = 'font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button


