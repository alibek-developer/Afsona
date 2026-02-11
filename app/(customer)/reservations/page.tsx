"use client";

import { useState } from "react"

// Qavatlar ma'lumotlari
const floorsData = {
  "1-qavat": { vip: "available", 1: "available", 2: "pending", 3: "booked", 4: "available", 5: "pending", 6: "available" },
  "2-qavat": { vip: "booked", 1: "booked", 2: "available", 3: "available", 4: "pending", 5: "booked", 6: "available" },
  "3-qavat": { vip: "available", 1: "pending", 2: "pending", 3: "pending", 4: "available", 5: "available", 6: "available" },
};

export default function RestaurantMap() {
  const [activeFloor, setActiveFloor] = useState<keyof typeof floorsData>("1-qavat");
  const [selected, setSelected] = useState<string | null>(null);

  const currentRooms = floorsData[activeFloor];

  const statusColor = (status: string) => {
    switch (status) {
      case "available": return "border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400";
      case "pending": return "border-amber-500/40 bg-amber-500/10 hover:border-amber-400";
      case "booked": return "border-rose-600/40 bg-rose-600/10 hover:border-rose-400";
      default: return "border-slate-600 bg-slate-800";
    }
  };

  const Room = ({ id }: { id: string }) => {
    const status = currentRooms[id as keyof typeof currentRooms];
    const isSelected = selected === `${activeFloor}-${id}`;
    
    return (
      <div
        onClick={() => setSelected(`${activeFloor}-${id}`)}
        className={`
          border rounded-2xl cursor-pointer transition-all duration-300
          flex items-center justify-center font-semibold text-sm w-full h-[110px]
          ${statusColor(status)}
          ${isSelected ? "ring-2 ring-red-500 scale-105 shadow-xl z-20" : ""}
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="tracking-wide text-slate-200 uppercase text-[11px]">
            {id === "vip" ? "VIP Xona" : `Xona ${id}`}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${
            status === 'available' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
          } shadow-[0_0_8px_currentcolor]`} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-screen h-screen bg-[#0B1220] flex flex-col items-center justify-center font-sans p-6">
      
      {/* TABS */}
      <div className="flex bg-[#111827] p-1.5 rounded-2xl mb-8 border border-slate-800 shadow-2xl">
        {Object.keys(floorsData).map((floor) => (
          <button
            key={floor}
            onClick={() => {
              setActiveFloor(floor as keyof typeof floorsData);
              setSelected(null);
            }}
            className={`px-10 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeFloor === floor 
              ? "bg-red-600 text-white shadow-lg shadow-red-900/40" 
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            {floor}
          </button>
        ))}
      </div>

      {/* ASOSIY MAP */}
      <div className="relative w-full h-full max-w-7xl bg-[#111827] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-800/50">
        
        <div className="flex flex-1">
          {/* 1. Chap blok: Mutlaqo toza "Ochiq maydon" va VIP */}
          <div className="w-[30%] flex flex-col gap-6 p-10 pr-5">
            <div className="flex-1"></div> {/* Hech qanday border va yozuv yo'q */}
            <Room id="vip" />
          </div>

          {/* 2. Markaz: Xona 1, 2, 3 */}
          <div className="w-[28%] flex flex-col justify-center gap-6 p-5">
            {["1", "2", "3"].map((id) => (
              <Room key={id} id={id} />
            ))}
          </div>

          {/* 3. Vertikal Kalidor (Faqat fon rangida) */}
          <div className="w-[10%] bg-slate-800/40 border-l border-slate-800/20"></div>

          {/* 4. O'ng blok: Xona 4, 5, 6 */}
          <div className="w-[32%] flex flex-col justify-center gap-6 p-10 pl-5">
            {["4", "5", "6"].map((id) => (
              <Room key={id} id={id} />
            ))}
          </div>
        </div>

        {/* 5. Pastki Kalidor (Faqat fon rangida) */}
        <div className="h-[15%] w-full bg-slate-800/40 border-t border-slate-800/20"></div>

      </div>


    </div>
  );
}