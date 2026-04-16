'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Bell, User, ChevronLeft, ChevronRight, ChevronDown, X, Phone, Sun, Moon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast, Toaster } from 'react-hot-toast';

// Order interface for real-time status
interface Order {
  id: string;
  table_id: string;
  customer_name: string;
  phone: string;
  status: 'active' | 'completed';
  created_at: string;
  completed_at?: string;
  total_amount: number;
}

// Table/Room interface from database
interface TableItem {
  id: string;
  name: string;
  capacity: number;
  price_per_hour: number;
  is_available: boolean;
  image_url: string;
  floor: string;
  active_order?: Order | null;
}

// Calendar data for October 2023 (rasmdagidek)
const CALENDAR_DATA = {
  month: "October 2023",
  today: 24,
  days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  weeks: [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null]
  ]
};

const TIME_SLOTS = [
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function RestaurantReservation() {
  const [selectedDate, setSelectedDate] = useState(24); // October 24, 2023
  const [selectedDateStr, setSelectedDateStr] = useState('2023-10-24'); // YYYY-MM-DD format
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[7]); // 19:00 default
  const [guestCount, setGuestCount] = useState(2);
  const [selectedFloor, setSelectedFloor] = useState('1-qavat');
  
  // Tables data from Supabase
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  interface SelectedSeating extends TableItem {
    type: 'room' | 'table';
  }

  const [selectedSeating, setSelectedSeating] = useState<SelectedSeating | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookedVenues, setBookedVenues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    phone: '',
    comment: ''
  });



  // Fetch booked venues when date changes
  useEffect(() => {
    fetchBookedVenues();
  }, [selectedDateStr]);

  async function fetchBookedVenues() {
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select('table_id')
        .eq('reservation_date', selectedDateStr)
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;
      
      const bookedIds = data?.map(r => r.table_id) || [];
      setBookedVenues(bookedIds);
    } catch (err: any) {
      console.error('Error fetching booked venues:', err);
    }
  }

  // Fetch tables with real-time status from Supabase
  const fetchTables = async () => {
    try {
      setLoading(true);
      
      // Fetch all tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false });

      if (tablesError) throw tablesError;

      // Fetch active orders
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'active');

      if (ordersError) throw ordersError;

      // Map tables with their status
      const tablesWithStatus = (tablesData || []).map((table: TableItem) => {
        const activeOrder = activeOrders?.find((order: Order) => order.table_id === table.id);
        return {
          ...table,
          is_available: !activeOrder,
          active_order: activeOrder || null
        };
      });

      setTables(tablesWithStatus);
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      toast.error('Xonalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchTables();

    // Subscribe to orders changes
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchTables();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const isVenueBooked = (venueId: string) => bookedVenues.includes(venueId);

  const handleSeatingClick = (item: TableItem, type: 'room' | 'table') => {
    if (!item.is_available || isVenueBooked(item.id)) {
      toast.error('Bu joy allaqachon band!');
      return;
    }
    const newSeating: SelectedSeating = { ...item, type };
    setSelectedSeating(newSeating);
  };

  const handleBookVenue = async () => {
    if (!selectedSeating) {
      toast.error('Iltimos, avval xona yoki stol tanlang');
      return;
    }
    setShowBookingModal(true);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.customerName || !bookingForm.phone) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }
    if (!selectedSeating) {
      toast.error('Xatolik yuz berdi');
      return;
    }

    setIsSubmitting(true);
    try {
      // Fetch the first branch to get branch_id
      const { data: branches, error: branchError } = await supabase.from('branches').select('id').limit(1);
      if (branchError || !branches || branches.length === 0) {
        throw new Error('Filial topilmadi. Iltimos keyinroq urinib ko\'ring.');
      }
      const branchId = branches[0].id;

      const { error } = await supabase.from('table_reservations').insert({
        branch_id: branchId,
        table_id: selectedSeating.id,
        customer_name: bookingForm.customerName.trim(),
        phone: bookingForm.phone.trim(),
        reservation_date: selectedDateStr,
        people_count: guestCount,
        start_time: selectedTime + ':00',
        end_time: '23:00:00',
        comment: bookingForm.comment.trim() || null,
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Bron muvaffaqiyatli qilindi!');
      
      // Update booked venues list
      if (selectedSeating) {
        setBookedVenues(prev => [...prev, selectedSeating.id]);
      }
      
      // Reset form and close modal
      setShowBookingModal(false);
      setBookingForm({ customerName: '', phone: '', comment: '' });
      setSelectedSeating(null);
    } catch (err: any) {
      console.error('Bron qilishda xato:', err);
      toast.error('Bron qilishda xato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkAvailability = () => {
    setShowAvailableOnly(true);
    setTimeout(() => setShowAvailableOnly(false), 5000);
  };

  const getFilteredRooms = (rooms: TableItem[]): TableItem[] => {
    if (!showAvailableOnly) return rooms;
    return rooms.filter((room: TableItem) => room.is_available && !isVenueBooked(room.id));
  };

  const getFilteredTables = (tables: TableItem[]): TableItem[] => {
    if (!showAvailableOnly) return tables;
    return tables.filter((table: TableItem) => table.is_available && !isVenueBooked(table.id));
  };

  const renderTableIcon = (isOccupied: boolean, isSelected: boolean, isVIP: boolean, capacity: number) => {
    const tableColor = isSelected ? 'bg-red-600' : isOccupied ? 'bg-red-400/90' : isVIP ? 'bg-[#986A2E]' : 'bg-[#D2A679]';
    const chairColor = isSelected ? 'bg-red-100' : isOccupied ? 'bg-red-100' : isVIP ? 'bg-[#EAE0D5]' : 'bg-[#EAE0D5]';
    
    const isRoom = capacity > 4;

    return (
      <div className="relative w-[80px] h-[70px] mx-auto mt-2 mb-4 flex items-center justify-center">
        {isRoom ? (
           <>
            {/* XONA (Room) - Wider table with 6 chairs */}
            {/* Top chairs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className={`w-3.5 h-2.5 rounded-t-sm ${chairColor}`} />
                <div className={`w-3.5 h-2.5 rounded-t-sm ${chairColor}`} />
                <div className={`w-3.5 h-2.5 rounded-t-sm ${chairColor}`} />
            </div>
            {/* Bottom chairs */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className={`w-3.5 h-2.5 rounded-b-sm ${chairColor}`} />
                <div className={`w-3.5 h-2.5 rounded-b-sm ${chairColor}`} />
                <div className={`w-3.5 h-2.5 rounded-b-sm ${chairColor}`} />
            </div>
            
            {/* Room Table body */}
            <div className={`w-[60px] h-12 rounded-lg ${tableColor} z-10 flex flex-col items-center justify-start pt-1 shadow-sm`}>
               {isVIP && !isSelected && <span className="text-white/80 text-[8px] font-black tracking-widest mt-1">VIP</span>}
            </div>
           </>
        ) : (
           <>
            {/* STOL (Table) - Square table with 4 cross chairs */}
            {/* Top chairs */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-1">
                <div className={`w-5 h-2 rounded-t-md ${chairColor}`} />
            </div>
            {/* Bottom chairs */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                <div className={`w-5 h-2 rounded-b-md ${chairColor}`} />
            </div>
            {/* Left chair */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2">
                <div className={`w-2 h-5 rounded-l-md ${chairColor}`} />
            </div>
            {/* Right chair */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <div className={`w-2 h-5 rounded-r-md ${chairColor}`} />
            </div>
            
            {/* Table body */}
            <div className={`w-[46px] h-[46px] rounded-[14px] ${tableColor} z-10 flex items-center justify-center shadow-sm`}>
               {isVIP && !isSelected && <span className="text-white/80 text-[8px] font-black tracking-widest relative -top-2">VIP</span>}
            </div>
           </>
        )}
      </div>
    );
  };


  const TableItemCard = ({ item }: { item: TableItem }) => {
    const isSelected = selectedSeating?.id === item.id;
    const isOccupied = !item.is_available || isVenueBooked(item.id);
    const isVIP = item.name.toLowerCase().includes('vip') || item.floor.includes('VIP');

    return (
      <button
        onClick={() => handleSeatingClick(item, item.capacity <= 4 ? 'table' : 'room')}
        disabled={isOccupied}
        className={`relative w-full py-6 px-2 rounded-[24px] border-2 transition-all flex flex-col items-center justify-center focus:outline-none
          ${isSelected ? 'border-red-600 bg-red-50/50' : 'border-transparent bg-[#f9fafb] hover:bg-gray-100 hover:scale-105 active:scale-95'}
          ${isOccupied && !isSelected ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {renderTableIcon(isOccupied, isSelected, isVIP, item.capacity)}
        
        {/* At the bottom overlapping the table */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[8px] z-20 ${isSelected ? 'bg-red-600' : isOccupied ? 'bg-red-400/90' : isVIP ? 'bg-[#986A2E]' : 'bg-[#D2A679]'} min-w-[50px] px-2 py-1 rounded-md text-white font-black text-[11px] shadow-md truncate max-w-[80px]`}>
           {item.name}
        </div>

        <div className="mt-4 text-center">
            <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-red-600' : 'text-slate-800'}`}>
                {isSelected ? 'Tanlandi' : isOccupied ? 'Band' : "Bo'sh"}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.capacity} kishi</p>
        </div>
      </button>
    );
  };

  // Extract unique floors
  const activeFloors = Array.from(new Set(tables.map(t => t.floor))).sort();

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-20">
      <Toaster position="top-center" />

      {/* Header Area */}
      <div className="bg-white pt-16 pb-12 w-full text-center relative shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100/60 font-black text-[120px] tracking-[0.2em] uppercase select-none pointer-events-none whitespace-nowrap overflow-hidden hidden md:block">
            RESERVATION
         </div>
         <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
             <h1 className="text-5xl md:text-[56px] font-black tracking-tighter uppercase text-slate-900 mb-4">Stol Band Qilish</h1>
             <p className="text-slate-500 font-medium md:text-lg">Kerakli sana, vaqt va xonani tanlang</p>
             
             <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Bepul bron
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Bekor qilish mumkin
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Darhol tasdiqlash
                </span>
             </div>
         </div>
      </div>

      {/* Progress Steps */}
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
              
              <div className="flex flex-col items-center gap-3 bg-[#f3f4f6] px-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shadow-[0_0_0_4px_#f3f4f6]">1</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Sana va Vaqt</span>
              </div>
              <div className="flex flex-col items-center gap-3 bg-[#f3f4f6] px-4">
                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shadow-[0_0_0_4px_#f3f4f6] ${selectedSeating ? 'bg-red-600 text-white' : 'bg-red-600 text-white'}`}>2</div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedSeating ? 'text-red-600' : 'text-red-600'}`}>Xona va Stol</span>
              </div>
              <div className="flex flex-col items-center gap-3 bg-[#f3f4f6] px-4">
                  <div className={`w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shadow-[0_0_0_4px_#f3f4f6]`}>3</div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500`}>Tasdiqlash</span>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* LEFT SIDEBAR (FORMS) */}
         <div className="col-span-1 lg:col-span-4 space-y-6">
            
            {/* Box 1: VAQTNI BELGILASH */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
               <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-800 mb-6">
                  <Calendar className="w-5 h-5 text-red-600" />
                  1. Vaqtni Belgilash
               </h3>

               <div className="space-y-5">
                   <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sana</label>
                       <input 
                          type="date" 
                          value={selectedDateStr}
                          onChange={(e) => {
                             setSelectedDateStr(e.target.value);
                             setSelectedDate(new Date(e.target.value).getDate());
                          }}
                          className="w-full bg-[#f1f2f4] border-none rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                       />
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vaqt</label>
                       <select 
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full bg-[#f1f2f4] border-none rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800 cursor-pointer"
                       >
                          {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mehmonlar Soni</label>
                       <div className="flex items-center justify-between bg-[#f1f2f4] rounded-xl px-2 py-1.5 h-12">
                           <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-red-500 font-bold hover:bg-slate-50 transition-colors">
                             -
                           </button>
                           <span className="font-black text-slate-800">{guestCount}</span>
                           <button onClick={() => setGuestCount(guestCount + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-red-500 font-bold hover:bg-slate-50 transition-colors">
                             +
                           </button>
                       </div>
                   </div>
               </div>
            </div>

            {/* Box 3: MA'LUMOTLAR */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
               <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-800 mb-6">
                  <User className="w-5 h-5 text-red-600" />
                  3. Ma'lumotlar
               </h3>

               <div className="bg-red-50/50 rounded-xl p-4 mb-5 border border-red-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Tanlangan vaqt:</p>
                  <p className="text-sm font-black text-slate-900">{selectedDateStr}, {selectedTime}</p>
               </div>

               <form onSubmit={submitBooking} className="space-y-4">
                   <input 
                      type="text" 
                      placeholder="Ismingiz" 
                      value={bookingForm.customerName}
                      onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})}
                      required
                      className="w-full bg-[#f1f2f4] border-none rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 placeholder:text-slate-400"
                   />
                   <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-bold text-sm">+998</span>
                       <input 
                          type="tel" 
                          placeholder="Telefon raqam" 
                          value={bookingForm.phone}
                          onChange={e => setBookingForm({...bookingForm, phone: e.target.value.replace(/\D/g, '').substring(0,9) })}
                          required
                          className="w-full bg-[#f1f2f4] border-none rounded-xl pl-16 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 placeholder:text-slate-400"
                       />
                   </div>
                   <textarea 
                      placeholder="Qo'shimcha izohlar (ixtiyoriy)" 
                      value={bookingForm.comment}
                      onChange={e => setBookingForm({...bookingForm, comment: e.target.value})}
                      rows={3}
                      className="w-full bg-[#f1f2f4] border-none rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 resize-none placeholder:text-slate-400"
                   />

                   <button 
                      type="submit"
                      disabled={isSubmitting || !selectedSeating}
                      className="w-full mt-2 bg-red-700 hover:bg-red-800 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Bronni Tasdiqlash'}
                   </button>
                   {!selectedSeating && (
                       <p className="text-[10px] text-red-500 font-bold text-center mt-2">Bron qilish uchun avval xona/stolni tanlang</p>
                   )}
               </form>
            </div>
         </div>

         {/* RIGHT AREA (TABLE MAP) */}
         <div className="col-span-1 lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 min-h-full">
                
                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-800">
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-red-100"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z'/%3E%3Cpath d='m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9'/%3E%3Cpath d='M12 3v6'/%3E%3C/svg%3E" className="w-3.5 h-3.5" /></span>
                        2. Xona va Stollar
                    </h3>

                    <div className="flex bg-[#f1f2f4] p-1 rounded-full overflow-x-auto w-full md:w-auto hide-scrollbar">
                        {activeFloors.length > 0 ? activeFloors.map(floor => {
                            const isVIP = floor.toLowerCase().includes('vip');
                            return (
                                <button
                                    key={floor}
                                    onClick={() => setSelectedFloor(floor)}
                                    className={`px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase whitespace-nowrap transition-all ${selectedFloor === floor ? 'bg-[#1e1e1e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    {isVIP ? <span className="text-yellow-500 mr-1">★</span> : ''} {floor}
                                </button>
                            );
                        }) : (
                            <div className="px-6 py-2 text-xs font-black tracking-widest uppercase text-slate-500">1-QAVAT</div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tables.filter(t => t.floor === selectedFloor).map(item => (
                                <TableItemCard key={item.id} item={item} />
                            ))}
                        </div>
                        {tables.filter(t => t.floor === selectedFloor).length === 0 && (
                            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                                Bu qavatda joylar topilmadi
                            </div>
                        )}
                    </>
                )}

                {/* Legend */}
                <div className="mt-12 pt-6 border-t border-slate-100 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-slate-700">Bo'sh</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400" /> <span className="text-slate-700">Band</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-600" /> <span className="text-slate-700">Tanlandi</span>
                    </div>
                </div>

            </div>
         </div>

      </div>
    </div>
  );
}