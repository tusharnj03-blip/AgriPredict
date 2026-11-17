import React from 'react'
import clsx from 'clsx'

export default function Card({
  title,
  subtitle,
  action,
  children,
  className,
  headerClassName,
  bodyClassName,
  hoverable = false,
  ...props
}) {
  return (
    <div
      className={clsx(
        hoverable ? 'card-hover' : 'card',
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={clsx('flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E5E9E3]', headerClassName)}>
          <div>
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && <p className="text-xs text-[#69766E] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  )
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  subtitle,
  icon: Icon,
  trend,
  className,
  onClick,
}) {
  return (
    <div
      className={clsx(
        'card p-4 transition-all',
        onClick && 'cursor-pointer hover:border-[#A8B9A5]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-[#69766E] tracking-tight truncate">{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded bg-[#F7F8F4] border border-[#E5E9E3] flex items-center justify-center text-[#183D2B] shrink-0">
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-[#10291F] tabular-nums">
          {value ?? '—'}
        </span>
        {unit && <span className="text-xs text-[#69766E] font-medium">{unit}</span>}
      </div>

      {(subtitle || change) && (
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          {change && (
            <span
              className={clsx(
                'font-medium tabular-nums',
                changeType === 'positive' && 'text-[#27865B]',
                changeType === 'negative' && 'text-[#D45B4C]',
                changeType === 'neutral' && 'text-[#69766E]'
              )}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-[#69766E] truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}

