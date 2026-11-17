import React from 'react'
import clsx from 'clsx'

export default function Tabs({
  tabs = [], // [{ id, label, icon: Icon, count }]
  activeTab,
  onChange,
  className = '',
  variant = 'underline', // 'underline' | 'segmented'
}) {
  if (variant === 'segmented') {
    return (
      <div className={clsx('inline-flex p-1 bg-[#F0F3EF] rounded-lg border border-[#E5E9E3]', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                isActive
                  ? 'bg-white text-[#10291F] shadow-sm font-semibold'
                  : 'text-[#69766E] hover:text-[#202923]'
              )}
            >
              {Icon && <Icon size={14} className={isActive ? 'text-[#183D2B]' : 'text-[#69766E]'} />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={clsx(
                    'text-[10px] px-1.5 py-0.2 rounded-full tabular-nums',
                    isActive ? 'bg-[#E9EFE9] text-[#183D2B]' : 'bg-[#E5E9E3] text-[#69766E]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={clsx('flex items-center border-b border-[#E5E9E3] gap-6', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 pb-2.5 text-xs font-medium transition-colors border-b-2 -mb-[1px]',
              isActive
                ? 'border-[#183D2B] text-[#183D2B] font-semibold'
                : 'border-transparent text-[#69766E] hover:text-[#202923] hover:border-[#D3DFD4]'
            )}
          >
            {Icon && <Icon size={14} />}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.2 rounded-full tabular-nums',
                  isActive ? 'bg-[#E9EFE9] text-[#183D2B]' : 'bg-[#F0F3EF] text-[#69766E]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

