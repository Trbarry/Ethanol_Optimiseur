type CardProps = {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={`rounded-2xl border border-brand-100/60 dark:border-brand-900/40
        bg-white dark:bg-surface-card-dark
        shadow-card p-5 ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="label-caps text-brand-600 dark:text-brand-400 mb-3">
      {children}
    </h2>
  )
}
