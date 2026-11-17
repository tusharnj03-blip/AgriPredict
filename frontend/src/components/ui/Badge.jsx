import React from 'react'
import clsx from 'clsx'

export default function Badge({
  children,
  variant = 'neutral', // 'low' | 'medium' | 'high' | 'forest' | 'neutral'
  size = 'md',
  dot = false,
  className,
}) {
  const variantClasses = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    forest: 'badge-forest',
    neutral: 'badge-neutral',
  }

  const dotClasses = {
    low: 'bg-[#27865B]',
    medium: 'bg-[#D69B35]',
    high: 'bg-[#D45B4C]',
    forest: 'bg-[#183D2B]',
    neutral: 'bg-[#69766E]',
  }

  return (
    <span
      className={clsx(
        'badge',
        variantClasses[variant] || 'badge-neutral',
        size === 'sm' && 'text-[10px] px-1.5 py-0.5',
        size === 'md' && 'text-[11px] px-2 py-0.5',
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotClasses[variant] || 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  )
}

export function RiskBadge({ level, score }) {
  const normalized = typeof score === 'number'
    ? score <= 33 ? 'low' : score <= 66 ? 'medium' : 'high'
    : (level || 'low').toLowerCase()

  const labels = {
    low: 'Low Risk',
    medium: 'Moderate Risk',
    high: 'Elevated Risk',
  }

  return (
    <Badge variant={normalized} dot>
      {labels[normalized]} {typeof score === 'number' ? `(${score.toFixed(0)})` : ''}
    </Badge>
  )
}

