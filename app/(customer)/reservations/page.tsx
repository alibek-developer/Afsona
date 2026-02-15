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

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Apply theme class to document and save to localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
      const { error } = await supabase.from('table_reservations').insert({
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

  const RoomCard = ({ room, isLarge = false }: { room: TableItem; isLarge?: boolean }) => {
    const isSelected = selectedSeating?.id === room.id;
    const isOccupied = !room.is_available || isVenueBooked(room.id);
    
    return (
      <button
        onClick={() => handleSeatingClick(room, 'room')}
        disabled={isOccupied}
        className={`
          relative p-5 rounded-2xl transition-all duration-300 group overflow-hidden
          ${isLarge ? 'col-span-2 row-span-2' : ''}
          ${isSelected ? 'bg-white dark:bg-[#1a2332] shadow-2xl scale-105 ring-4 ring-green-600 ring-opacity-50' : ''}
          ${isOccupied && !isSelected ? 'bg-slate-50 dark:bg-red-900/20 cursor-not-allowed opacity-70' : ''}
          ${!isSelected && !isOccupied ? 'bg-white dark:bg-[#1a2332] shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1' : ''}
          ${!isOccupied ? 'cursor-pointer' : ''}
        `}
        style={{
          border: isSelected 
            ? '3px solid #16a34a' 
            : isOccupied 
              ? '2px solid #fca5a5' 
              : '2px solid #86efac'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`,
            color: isOccupied ? '#ef4444' : '#22c55e'
          }} />
        </div>

        {/* Status Badge */}
        <div className={`
          absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10
          ${isSelected ? 'bg-green-600 text-white' : ''}
          ${isOccupied && !isSelected ? 'bg-red-500 text-white' : ''}
          ${!isSelected && !isOccupied ? 'bg-green-500 text-white' : ''}
        `}>
          {isSelected ? 'Tanlandi' : isOccupied ? 'Band' : "Bo'sh"}
        </div>

        {/* Content */}
        <div className="relative z-10 mt-8">
          <div className={`
            font-bold text-xl mb-3
            ${isSelected ? 'text-green-700 dark:text-green-400' : isOccupied ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-white'}
          `}>
            {room.name}
          </div>
          
          <div className="flex items-center gap-2 justify-center">
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold
              ${isSelected ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : ''}
              ${isOccupied ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-300' : ''}
              ${!isSelected && !isOccupied ? 'bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300' : ''}
            `}>
              <Users className="w-4 h-4" />
              <span>Sig'imi: {room.capacity} kishi</span>
            </div>
          </div>
        </div>

        {/* 3D Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-black/5 to-transparent rounded-b-2xl" />
      </button>
    );
  };

  const TableCard = ({ table }: { table: TableItem }) => {
    const isSelected = selectedSeating?.id === table.id;
    const isOccupied = !table.is_available || isVenueBooked(table.id);
    
    return (
      <button
        onClick={() => handleSeatingClick(table, 'table')}
        disabled={isOccupied}
        className={`
          relative w-40 h-40 rounded-full transition-all duration-300 flex flex-col items-center justify-center
          ${isSelected ? 'scale-110 shadow-2xl' : ''}
          ${isOccupied && !isSelected ? 'cursor-not-allowed opacity-70 scale-95' : ''}
          ${!isSelected && !isOccupied ? 'shadow-xl hover:shadow-2xl hover:scale-110 hover:-translate-y-2' : ''}
          ${!isOccupied ? 'cursor-pointer' : ''}
        `}
        style={{
          background: isSelected 
            ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
            : isOccupied 
              ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          border: isSelected 
            ? '4px solid #16a34a' 
            : isOccupied 
              ? '4px solid #fca5a5' 
              : '4px solid #86efac'
        }}
      >
        {/* Table Surface - Dark mode handled via CSS class */}
        <div 
          className={`absolute inset-4 rounded-full ${isSelected 
            ? 'dark:bg-gradient-to-br dark:from-green-900/40 dark:to-green-800/30' 
            : isOccupied 
              ? 'dark:bg-gradient-to-br dark:from-red-900/40 dark:to-red-800/30'
              : 'dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900'}`}
          style={{
            background: isSelected 
              ? 'radial-gradient(circle at 30% 30%, #f0fdf4, #dcfce7, #bbf7d0)' 
              : isOccupied
                ? 'radial-gradient(circle at 30% 30%, #fef2f2, #fee2e2, #fecaca)'
                : 'radial-gradient(circle at 30% 30%, #ffffff, #f3f4f6, #e5e7eb)'
          }}
        />

        {/* Table Content */}
        <div className="relative z-10 text-center">
          <div className={`
            font-bold text-2xl mb-1
            ${isSelected ? 'text-green-700 dark:text-green-400' : isOccupied ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-white'}
          `}>
            {table.name}
          </div>
          <div className={`
            text-xs font-semibold flex items-center justify-center gap-1
            ${isSelected ? 'text-green-600 dark:text-green-300' : isOccupied ? 'text-red-400 dark:text-red-300' : 'text-slate-500 dark:text-gray-400'}
          `}>
            <Users className="w-3 h-3" />
            <span>{table.capacity} kishi</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`
          absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-xl z-20
          ${isSelected ? 'bg-green-600 text-white ring-4 ring-green-200 dark:ring-green-800' : ''}
          ${isOccupied && !isSelected ? 'bg-red-500 text-white ring-4 ring-red-200 dark:ring-red-800' : ''}
          ${!isSelected && !isOccupied ? 'bg-green-500 text-white ring-4 ring-green-200 dark:ring-green-800' : ''}
        `}>
          {isSelected ? '✓' : isOccupied ? '✕' : '✓'}
        </div>
      </button>
    );
  };

  const renderFloorContent = () => {
    // Filter tables by selected floor
    const floorTables = tables.filter((table: TableItem) => table.floor === selectedFloor);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-500" size={40} />
        </div>
      );
    }

    if (floorTables.length === 0) {
      return (
        <div className="text-center py-20 text-slate-400 font-bold">
          {selectedFloor} da xonalar topilmadi
        </div>
      );
    }

    // Separate rooms (capacity > 4) and tables (capacity <= 4)
    const rooms = floorTables.filter((t: TableItem) => t.capacity > 4);
    const smallTables = floorTables.filter((t: TableItem) => t.capacity <= 4);
    
    const filteredRooms = getFilteredRooms(rooms);
    const filteredTables = getFilteredTables(smallTables);
    
    return (
      <div className="space-y-8">
        {filteredRooms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-4 uppercase tracking-wide transition-colors duration-300">Xonalar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRooms.map((room: TableItem) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        )}
        
        {filteredTables.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-4 uppercase tracking-wide transition-colors duration-300">Stollar</h3>
            <div className="flex flex-wrap gap-8 justify-center">
              {filteredTables.map((table: TableItem) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] transition-colors duration-300">
      <Toaster position="top-center" />
      
      {/* Booking Modal */}
{showBookingModal && selectedSeating && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
    onClick={() => setShowBookingModal(false)}
  >
    <div
      className="relative bg-white/95 dark:bg-[#111827]/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-gray-700 transform transition-transform duration-500 scale-95 animate-scaleUp transition-colors duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      {/* LEFT IMAGE */}
      <div className="md:w-5/12 relative h-96 md:h-full overflow-hidden rounded-l-3xl flex-shrink-0 flex flex-col justify-between">
        <img
          src={
            selectedSeating.image_url ||
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=90"
          }
          alt={selectedSeating.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        {/* DATE & TIME */}
        <div className="absolute top-4 left-4 bg-white/80 dark:bg-[#1a2332]/80 backdrop-blur-sm px-5 py-3 rounded-3xl shadow-lg animate-slideInLeft transition-colors duration-300">
          <span className="text-sm text-slate-700 dark:text-gray-300 font-semibold transition-colors duration-300">Sana:</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">{selectedDateStr}</p>
          <span className="text-sm text-slate-700 dark:text-gray-300 font-semibold mt-2 transition-colors duration-300">Vaqt:</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">{selectedTime}</p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="md:w-7/12 flex flex-col overflow-hidden bg-gradient-to-br from-white/90 to-white/70 dark:from-[#111827]/90 dark:to-[#0B1220]/70 transition-colors duration-300">
        <form
          onSubmit={submitBooking}
          className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 animate-fadeInUp"
        >
          {/* HEADER */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-gray-700 transition-colors duration-300">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white animate-slideInLeft transition-colors duration-300">
                Bron Qilish
              </h2>
              <p className="text-slate-600 dark:text-gray-400 mt-1 text-sm md:text-base transition-colors duration-300">
                {selectedSeating.name} • {guestCount} kishi
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 transition-all p-2 -mr-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* NAME + PHONE */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                value={bookingForm.customerName}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, customerName: e.target.value })
                }
                placeholder="Ismingiz"
                required
                className="w-full pl-12 pr-4 py-4 border border-slate-300 dark:border-gray-600 rounded-2xl text-base focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none bg-white/70 dark:bg-[#1a2332]/70 dark:text-white transition-all hover:shadow-md duration-300"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            </div>

            <div className="relative">
              <input
                type="tel"
                value={bookingForm.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  if (val.length <= 12)
                    setBookingForm({ ...bookingForm, phone: val });
                }}
                placeholder="Telefon"
                required
                className="w-full pl-12 pr-4 py-4 border border-slate-300 dark:border-gray-600 rounded-2xl text-base focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none bg-white/70 dark:bg-[#1a2332]/70 dark:text-white transition-all hover:shadow-md duration-300"
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            </div>
          </div>

          {/* COMMENT */}
          <div>
            <textarea
              value={bookingForm.comment}
              onChange={(e) =>
                setBookingForm({ ...bookingForm, comment: e.target.value })
              }
              placeholder="Qo‘shimcha izoh..."
              rows={3}
              className="w-full px-5 py-4 border border-slate-300 dark:border-gray-600 rounded-2xl text-base focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none resize-none bg-white/70 dark:bg-[#1a2332]/70 dark:text-white transition-all hover:shadow-md duration-300"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 font-bold hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              Bekor
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !bookingForm.customerName ||
                bookingForm.phone.length !== 13
              }
              className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saqlanmoqda..." : "Bron qilish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}



 

      {/* Header with Theme Toggle */}
      <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
            Stol Bron Qilish
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-all duration-300"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Booking Controls */}
        <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 mb-8 transition-colors duration-300">
          {/* SELECT DATE - rasmdagidek */}
          <div className="mb-6 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">SELECT DATE</h2>
              <div className="text-sm text-slate-500 dark:text-gray-400 transition-colors duration-300">October 24, 2023</div>
            </div>
            
            {/* Custom Date Picker Trigger */}
            <button
              onClick={toggleCalendar}
              className="w-full px-4 py-3 bg-white dark:bg-[#1a2332] border-2 border-slate-200 dark:border-gray-700 rounded-xl flex items-center justify-between text-slate-900 dark:text-white font-medium hover:border-red-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-red-600" />
                <span>October {selectedDate}, 2023</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 dark:text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
            </button>

            {/* Calendar Popover */}
            {showCalendar && (
              <div className="absolute z-50 mt-2 w-full bg-white dark:bg-[#1a2332] rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                {/* Month Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-gray-700 transition-colors duration-300">
                  <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-300">
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                  </button>
                  <span className="font-medium text-slate-800 dark:text-white transition-colors duration-300">October 2023</span>
                  <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-300">
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 bg-white dark:bg-[#1a2332] border-b border-slate-200 dark:border-gray-700 transition-colors duration-300">
                  {CALENDAR_DATA.days.map((day: string) => (
                    <div key={day} className="py-3 text-center text-sm font-medium text-slate-500 dark:text-gray-400 transition-colors duration-300">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                {CALENDAR_DATA.weeks.map((week: (number | null)[], weekIndex: number) => (
                  <div key={weekIndex} className="grid grid-cols-7">
                    {week.map((date, dayIndex) => {
                      const isToday = date === CALENDAR_DATA.today;
                      const isSelected = selectedDate === date;
                      const hasHighAvailability = date && date >= 22 && date <= 27; // rasmdagidagi nuqtalar

                      return (
                        <button
                          key={`${weekIndex}-${dayIndex}`}
                          onClick={() => {
                            if (date) {
                              setSelectedDate(date);
                              // Convert to YYYY-MM-DD format (mock data is October 2023)
                              const month = '10';
                              const dayStr = date.toString().padStart(2, '0');
                              setSelectedDateStr(`2023-${month}-${dayStr}`);
                              setShowCalendar(false);
                            }
                          }}
                          disabled={!date}
                          className={`
                            relative py-3 text-center text-sm border-r border-b border-slate-100 dark:border-gray-700 transition-all duration-300
                            ${!date ? 'bg-slate-50 dark:bg-[#111827] cursor-default' : 'hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer'}
                            ${isSelected ? 'bg-red-600 text-white font-bold' : ''}
                            ${isToday && !isSelected ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-bold' : ''}
                            ${date && !isSelected && !isToday ? 'text-slate-800 dark:text-gray-200' : ''}
                            ${dayIndex === 6 ? 'border-r-0' : ''}
                            ${weekIndex === 4 ? 'border-b-0' : ''}
                          `}
                        >
                          {date || ''}
                          {hasHighAvailability && !isSelected && !isToday && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Legend */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-slate-600 dark:text-gray-400 transition-colors duration-300">High Availability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                      <span className="text-slate-600 dark:text-gray-400 transition-colors duration-300">TODAY</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 flex-wrap mt-6">
            {/* Time Selector */}
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase transition-colors duration-300">Vaqtni tanlang</label>
              <select 
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a2332] text-slate-900 dark:text-white cursor-pointer hover:border-red-500 transition-all w-full font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 duration-300"
              >
                {TIME_SLOTS.map((time: string) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Guest Count */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase transition-colors duration-300">Mehmonlar</label>
              <select 
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="px-4 py-3 border-2 border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a2332] text-slate-900 dark:text-white cursor-pointer hover:border-red-500 transition-all w-full font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 duration-300"
              >
                {[8,12, 15].map(num => (
                  <option key={num} value={num}>{num} kishi</option>
                ))}
              </select>
            </div>

            {/* Check Availability Button */}
            <button 
              onClick={checkAvailability}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-w-[160px]"
            >
              Bo'shligini<br/>Tekshirish
            </button>
          </div>

          {/* Availability Message */}
          {showAvailableOnly && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-300">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium flex items-center gap-2 transition-colors duration-300">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Faqat bo'sh joylar ko'rsatilmoqda
              </p>
            </div>
          )}
        </div>

        {/* Floor Selection & Seating */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Floor Selection */}
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 transition-colors duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">Qavatni tanlang</h3>
              <div className="space-y-2">
                {['1-qavat', '2-qavat', '3-qavat'].map(floor => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium
                      ${selectedFloor === floor 
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-md border-l-4 border-red-600' 
                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedFloor === floor ? 'bg-red-600' : 'bg-slate-300 dark:bg-gray-600'}`} />
                    {floor}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 transition-colors duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Sizning Tanlovingiz</h3>
              
              {selectedSeating ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-700 transition-colors duration-300">
                    <span className="text-slate-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">Sana</span>
                    <span className="font-semibold text-slate-900 dark:text-white transition-colors duration-300">
                      October {selectedDate}, 2023
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-700 transition-colors duration-300">
                    <span className="text-slate-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">Vaqt</span>
                    <span className="font-semibold text-slate-900 dark:text-white transition-colors duration-300">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-700 transition-colors duration-300">
                    <span className="text-slate-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">Mehmonlar</span>
                    <span className="font-semibold text-slate-900 dark:text-white transition-colors duration-300">{guestCount} kishi</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-700 transition-colors duration-300">
                    <span className="text-slate-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">{(selectedSeating as SelectedSeating).type === 'table' ? 'Stol' : 'Xona'}</span>
                    <span className="font-semibold text-slate-900 dark:text-white transition-colors duration-300">{(selectedSeating as SelectedSeating).name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-700 transition-colors duration-300">
                    <span className="text-slate-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">Qavat</span>
                    <span className="font-semibold text-slate-900 dark:text-white transition-colors duration-300">{(selectedSeating as SelectedSeating).floor}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-gray-700 pb-4 transition-colors duration-300">
                    <span className="text-slate-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300">Sig'imi</span>
                    <span className="font-semibold text-slate-900 dark:text-white transition-colors duration-300">{(selectedSeating as SelectedSeating).capacity} kishi</span>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-relaxed transition-colors duration-300">
                      10 000 so'm qaytarilmaydigan bron to'lovi yakuniy hisobga qo'shiladi.
                    </p>
                    
                    <button 
                      onClick={handleBookVenue}
                      disabled={isVenueBooked(selectedSeating.id)}
                      className={`w-full py-3.5 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl
                        ${isVenueBooked(selectedSeating.id) 
                          ? 'bg-red-500 text-white cursor-not-allowed' 
                          : 'bg-slate-900 dark:bg-red-600 text-white hover:bg-slate-800 dark:hover:bg-red-700'
                        }`}
                    >
                      {isVenueBooked(selectedSeating.id) 
                        ? 'Band' 
                        : `${selectedSeating.type === 'table' ? 'Stolni' : 'Xonani'} Tasdiqlash`
                      }
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-gray-500 transition-colors duration-300">
                  <p className="text-sm font-medium">Hali tanlov yo'q</p>
                  <p className="text-xs mt-2">Xaritadan xona yoki stol tanlang</p>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl shadow-sm p-6 border border-red-100 dark:border-red-800 transition-colors duration-300">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 transition-colors duration-300">
                <Clock className="w-4 h-4 text-red-600" />
                Bron qilish vaqti
              </h4>
              <div className="text-sm text-slate-600 dark:text-gray-400 space-y-2 transition-colors duration-300">
                <p className="flex justify-between">
                  <span>Sana:</span>
                  <span className="font-medium text-slate-900 dark:text-white transition-colors duration-300">October {selectedDate}, 2023</span>
                </p>
                <p className="flex justify-between">
                  <span>Vaqt:</span>
                  <span className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{selectedTime}</span>
                </p>
                <p className="flex justify-between">
                  <span>Mehmonlar:</span>
                  <span className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{guestCount} kishi</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-9">
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm dark:shadow-gray-900/50 p-8 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{selectedFloor}</h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 transition-colors duration-300">Quyidagi interaktiv xaritadan kerakli joyni tanlang.</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-green-500 bg-white dark:bg-[#1a2332] transition-colors duration-300" />
                    <span className="text-slate-600 dark:text-gray-400 font-medium transition-colors duration-300">Bo'sh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600 border-2 border-green-700" />
                    <span className="text-slate-600 dark:text-gray-400 font-medium transition-colors duration-300">Tanlandi</span>
                  </div>
                </div>
              </div>

              {renderFloorContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-gray-400 transition-colors duration-300">
            <p>© 2024 Premium Ovqatlanish Guruhi. Barcha huquqlar himoyalangan.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Maxfiylik Siyosati</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Foydalanish Shartlari</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Bekor Qilish Siyosati</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}