type CardProps = {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={`rounded-xl border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        shadow-sm p-4 ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
      {children}
    </h2>
  )
}
