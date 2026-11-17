import React from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  hint,
  error,
  options = [],
  placeholder = 'Select option...',
  required,
  className,
  wrapperClassName,
  value,
  onChange,
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
        <select
          value={value}
          onChange={onChange}
          className={clsx(
            'input-field pr-9 appearance-none bg-white cursor-pointer',
            error && 'border-[#D45B4C]',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const isObj = typeof opt === 'object' && opt !== null
            const optVal = isObj ? opt.value : opt
            const optLabel = isObj ? opt.label : opt
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            )
          })}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69766E] pointer-events-none"
        />
      </div>

      {error ? (
        <p className="text-[11px] text-[#D45B4C] mt-1 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[#69766E] mt-1">{hint}</p>
      ) : null}
    </div>
  )
}

