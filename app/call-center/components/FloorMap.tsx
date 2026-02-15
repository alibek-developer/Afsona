'use client'

import { RoomCard } from './RoomCard'

interface Order {
  id: string
  table_id: string
  customer_name: string
  phone: string
  status: 'active' | 'completed'
  created_at: string
  completed_at?: string
  total_amount: number
}

interface Xona {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  is_available: boolean
  image_url: string
  floor: string
  active_order: Order | null
}

interface FloorMapProps {
  xonalar: Xona[]
  selectedXona: Xona | null
  onSelectXona: (xona: Xona) => void
  onPreviewXona: (xona: Xona) => void
  onCompleteOrder: (orderId: string) => void
  activeFloor: string
  searchTerm?: string
}

export function FloorMap({
  xonalar,
  selectedXona,
  onSelectXona,
  onPreviewXona,
  onCompleteOrder,
  activeFloor,
  searchTerm = '',
}: FloorMapProps) {
  // Filter xonalar based on search term
  const filteredXonalar = xonalar.filter((x) =>
    x.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort xonalar: Room 10 and 11 should be first (side by side in top row) for 3-qavat
  // Then rooms 1-9
  const sortedXonalar = [...filteredXonalar].sort((a, b) => {
    const getNum = (name: string) => {
      const match = name.match(/\d+/)
      return match ? parseInt(match[0]) : 0
    }
    const numA = getNum(a.name)
    const numB = getNum(b.name)
    
    // Special handling: 10 and 11 come first
    if (numA >= 10 && numB >= 10) return numA - numB
    if (numA >= 10) return -1
    if (numB >= 10) return 1
    return numA - numB
  })

  // Separate rooms 10-11 for top row and 1-9 for bottom (only for 3-qavat)
  const topRowXonalar = activeFloor === '3-qavat' 
    ? sortedXonalar.filter((x) => {
        const match = x.name.match(/\d+/)
        const num = match ? parseInt(match[0]) : 0
        return num >= 10
      })
    : []

  const bottomRowXonalar = activeFloor === '3-qavat'
    ? sortedXonalar.filter((x) => {
        const match = x.name.match(/\d+/)
        const num = match ? parseInt(match[0]) : 0
        return num < 10
      })
    : sortedXonalar

  if (filteredXonalar.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-slate-400 font-bold bg-white dark:bg-[#111827] rounded-3xl">
        {activeFloor} da hech qanday xona topilmadi
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Row - Rooms 10 & 11 (Side by side) - Only for 3-qavat */}
      {topRowXonalar.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl">🏢</span>
            <h2 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400">
              KATTA XONALAR
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {topRowXonalar.map((xona) => (
              <RoomCard
                key={xona.id}
                xona={xona}
                isSelected={selectedXona?.id === xona.id}
                onSelect={onSelectXona}
                onPreview={onPreviewXona}
                onCompleteOrder={onCompleteOrder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Bottom Row - Standard Rooms */}
      {bottomRowXonalar.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl">🚪</span>
            <h2 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400">
              {activeFloor === '3-qavat' ? 'STANDART XONALAR' : 'BARCHA XONALAR'}
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {bottomRowXonalar.map((xona) => (
              <RoomCard
                key={xona.id}
                xona={xona}
                isSelected={selectedXona?.id === xona.id}
                onSelect={onSelectXona}
                onPreview={onPreviewXona}
                onCompleteOrder={onCompleteOrder}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
