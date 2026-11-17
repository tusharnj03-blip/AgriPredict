import React from 'react'
import { Sprout } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = Sprout,
  title = 'No records found',
  description = 'There is currently no data recorded for this section.',
  actionLabel,
  onAction,
  actionLink,
  className = '',
}) {
  return (
    <div className={`p-8 rounded-lg border border-dashed border-[#E5E9E3] bg-[#FAFBF9] text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-[#EEF2EC] flex items-center justify-center text-[#183D2B] mb-3">
        <Icon size={20} />
      </div>
      <h4 className="text-sm font-semibold text-[#10291F] mb-1">{title}</h4>
      <p className="text-xs text-[#69766E] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && (
        actionLink ? (
          <a href={actionLink} className="btn-primary text-xs">
            {actionLabel}
          </a>
        ) : (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}

