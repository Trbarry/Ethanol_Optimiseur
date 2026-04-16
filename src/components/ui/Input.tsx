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
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border px-3 py-2 text-base
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-brand-500
              disabled:opacity-50
              ${unit ? 'pr-14' : ''}
              ${error ? 'border-red-500 focus:ring-red-400' : ''}
              ${className}`}
            {...props}
          />
          {unit && (
            <span className="absolute right-3 text-sm text-gray-500 dark:text-gray-400 pointer-events-none select-none">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
