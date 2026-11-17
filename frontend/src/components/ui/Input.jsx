import React from 'react'
import clsx from 'clsx'

export default function Input({
  label,
  hint,
  error,
  unit,
  icon: Icon,
  required,
  className,
  wrapperClassName,
  ...props
}) {
  return (
    <div className={clsx('w-full', wrapperClassName)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-[#D45B4C] ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69766E] pointer-events-none">
            <Icon size={15} />
          </div>
        )}

        <input
          className={clsx(
            'input-field',
            Icon && 'pl-9',
            unit && 'pr-12',
            error && 'border-[#D45B4C] focus:border-[#D45B4C] focus:ring-[#D45B4C]/20',
            className
          )}
          {...props}
        />

        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#69766E] pointer-events-none">
            {unit}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-[#D45B4C] mt-1 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[#69766E] mt-1">{hint}</p>
      ) : null}
    </div>
  )
}

