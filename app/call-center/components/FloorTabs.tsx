'use client'

import { cn } from '@/lib/utils'

interface FloorTabsProps {
  activeFloor: string
  onFloorChange: (floor: '1-qavat' | '2-qavat' | '3-qavat') => void
}

const FLOORS = [
  { id: '1-qavat', label: '1-QAVAT', icon: '1️⃣' },
  { id: '2-qavat', label: '2-QAVAT', icon: '2️⃣' },
  { id: '3-qavat', label: '3-QAVAT', icon: '3️⃣' },
] as const

export function FloorTabs({ activeFloor, onFloorChange }: FloorTabsProps) {
  return (
    <div className="flex p-1.5 bg-white dark:bg-[#111827] rounded-[1.25rem] shadow-sm">
      {FLOORS.map((floor) => (
        <button
          key={floor.id}
          onClick={() => onFloorChange(floor.id)}
          className={cn(
            'flex-1 h-14 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2',
            activeFloor === floor.id
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          )}
        >
          <span>{floor.icon}</span>
          {floor.label}
        </button>
      ))}
    </div>
  )
}
