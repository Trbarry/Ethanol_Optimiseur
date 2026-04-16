import { forwardRef } from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  unit?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, unit, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-gray-400 dark:text-gray-500"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border px-3 py-2.5 text-base font-medium
              bg-white dark:bg-gray-800/60
              text-gray-800 dark:text-gray-100
              border-gray-200 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
              disabled:opacity-50
              ${unit ? 'pr-12' : ''}
              ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
            {...props}
          />
          {unit && (
            <span className="absolute right-3 text-sm text-gray-300 dark:text-gray-500 pointer-events-none select-none font-medium">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
