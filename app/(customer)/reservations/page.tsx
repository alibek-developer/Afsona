'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Bell, User, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast, Toaster } from 'react-hot-toast';


// Mock data for the booking system
const MOCK_DATA = {
  floors: {
    '1-qavat': {
      rooms: [
        { id: 'R-101', name: 'Xona 101', capacity: 8, status: 'available' as const },
        { id: 'R-102', name: 'Xona 102', capacity: 8, status: 'available' as const },
        { id: 'R-103', name: 'Xona 103', capacity: 8, status: 'available' as const },
        { id: 'R-104', name: 'Xona 104', capacity: 8, status: 'available' as const },
        { id: 'R-105', name: 'Xona 105', capacity: 8, status: 'available' as const },
        { id: 'R-106', name: 'Xona 106', capacity: 8, status: 'available' as const },
        { id: 'R-107', name: 'Xona 107', capacity: 8, status: 'available' as const }
      ]
    },
    '2-qavat': {
      rooms: [
        { id: 'R-201', name: 'Xona 201', capacity: 8, status: 'available' as const },
        { id: 'R-202', name: 'Xona 202', capacity: 8, status: 'available' as const },
        { id: 'R-203', name: 'Xona 203', capacity: 8, status: 'available' as const },
        { id: 'R-204', name: 'Xona 204', capacity: 8, status: 'available' as const },
        { id: 'R-205', name: 'Xona 205', capacity: 8, status: 'available' as const }
      ],
      ceremonyHall: { id: 'CH-201', name: 'Katta Marosim Zali', capacity: 50, status: 'available' as const }
    },
    '3-qavat': {
      rooms: [
        { id: 'R-301', name: 'Xona 301', capacity: 8, status: 'available' as const },
        { id: 'R-302', name: 'Xona 302', capacity: 8, status: 'available' as const },
        { id: 'R-303', name: 'Xona 303', capacity: 8, status: 'available' as const },
        { id: 'R-304', name: 'Xona 304', capacity: 8, status: 'available' as const },
        { id: 'R-305', name: 'Xona 305', capacity: 8, status: 'available' as const },
        { id: 'R-306', name: 'Xona 306', capacity: 8, status: 'available' as const },
        { id: 'R-307', name: 'Xona 307', capacity: 8, status: 'available' as const },
        { id: 'R-308', name: 'Xona 308', capacity: 8, status: 'available' as const },
        { id: 'R-309', name: 'Xona 309', capacity: 8, status: 'available' as const }
      ],
      tables: [
        { id: 'T-301', name: 'Stol 01', capacity: 4, status: 'available' as const },
        { id: 'T-302', name: 'Stol 02', capacity: 4, status: 'available' as const },
        { id: 'T-303', name: 'Stol 03', capacity: 4, status: 'available' as const },
        { id: 'T-304', name: 'Stol 04', capacity: 4, status: 'available' as const },
        { id: 'T-305', name: 'Stol 05', capacity: 4, status: 'available' as const },
        { id: 'T-306', name: 'Stol 06', capacity: 4, status: 'available' as const },
        { id: 'T-307', name: 'Stol 07', capacity: 4, status: 'available' as const },
        { id: 'T-308', name: 'Stol 08', capacity: 4, status: 'available' as const }
      ]
    }
  },
  // Calendar data for October 2023 (rasmdagidek)
  calendarData: {
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
  },
  timeSlots: [
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ]
};

export default function RestaurantReservation() {
  const [selectedDate, setSelectedDate] = useState(24); // October 24, 2023
  const [selectedDateStr, setSelectedDateStr] = useState('2023-10-24'); // YYYY-MM-DD format
  const [selectedTime, setSelectedTime] = useState(MOCK_DATA.timeSlots[7]); // 19:00 default
  const [guestCount, setGuestCount] = useState(2);
  const [selectedFloor, setSelectedFloor] = useState('1-qavat');
  interface SelectedSeating extends SeatingItem {
    type: 'room' | 'table';
    floor: string;
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

  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const isVenueBooked = (venueId: string) => bookedVenues.includes(venueId);

  interface SeatingItem {
    id: string;
    name: string;
    capacity: number;
    status: string;
  }

  const handleSeatingClick = (item: SeatingItem, type: 'room' | 'table') => {
    if (isVenueBooked(item.id)) {
      toast.error('Bu joy allaqachon band!');
      return;
    }
    const newSeating: SelectedSeating = { ...item, type, floor: selectedFloor };
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

  const getFilteredRooms = (rooms: SeatingItem[]): SeatingItem[] => {
    if (!showAvailableOnly) return rooms;
    return rooms.filter((room: SeatingItem) => !isVenueBooked(room.id));
  };

  const getFilteredTables = (tables: SeatingItem[]): SeatingItem[] => {
    if (!showAvailableOnly) return tables;
    return tables.filter((table: SeatingItem) => !isVenueBooked(table.id));
  };

  const RoomCard = ({ room, isLarge = false }: { room: SeatingItem; isLarge?: boolean }) => {
    const isSelected = selectedSeating?.id === room.id;
    const isOccupied = isVenueBooked(room.id);
    
    return (
      <button
        onClick={() => handleSeatingClick(room, 'room')}
        disabled={isOccupied}
        className={`
          relative p-5 rounded-2xl transition-all duration-300 group overflow-hidden
          ${isLarge ? 'col-span-2 row-span-2' : ''}
          ${isSelected ? 'bg-white shadow-2xl scale-105 ring-4 ring-green-600 ring-opacity-50' : ''}
          ${isOccupied && !isSelected ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}
          ${!isSelected && !isOccupied ? 'bg-white shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1' : ''}
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
        <div className="absolute inset-0 opacity-5">
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
            ${isSelected ? 'text-green-700' : isOccupied ? 'text-red-500' : 'text-gray-800'}
          `}>
            {room.name}
          </div>
          
          <div className="flex items-center gap-2 justify-center">
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold
              ${isSelected ? 'bg-green-50 text-green-700' : ''}
              ${isOccupied ? 'bg-red-50 text-red-500' : ''}
              ${!isSelected && !isOccupied ? 'bg-gray-50 text-gray-600' : ''}
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

  const TableCard = ({ table }: { table: SeatingItem }) => {
    const isSelected = selectedSeating?.id === table.id;
    const isOccupied = isVenueBooked(table.id);
    
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
        {/* Table Surface */}
        <div 
          className="absolute inset-4 rounded-full"
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
            ${isSelected ? 'text-green-700' : isOccupied ? 'text-red-500' : 'text-gray-800'}
          `}>
            {table.name}
          </div>
          <div className={`
            text-xs font-semibold flex items-center justify-center gap-1
            ${isSelected ? 'text-green-600' : isOccupied ? 'text-red-400' : 'text-gray-500'}
          `}>
            <Users className="w-3 h-3" />
            <span>{table.capacity} kishi</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`
          absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-xl z-20
          ${isSelected ? 'bg-green-600 text-white ring-4 ring-green-200' : ''}
          ${isOccupied && !isSelected ? 'bg-red-500 text-white ring-4 ring-red-200' : ''}
          ${!isSelected && !isOccupied ? 'bg-green-500 text-white ring-4 ring-green-200' : ''}
        `}>
          {isSelected ? '✓' : isOccupied ? '✕' : '✓'}
        </div>
      </button>
    );
  };

  const renderFloorContent = () => {
    if (selectedFloor === '1-qavat') {
      const floor1Data = MOCK_DATA.floors['1-qavat'];
      return (
        <div className="grid grid-cols-3 gap-6">
          {getFilteredRooms(floor1Data.rooms).map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      );
    }

    if (selectedFloor === '2-qavat') {
      const floor2 = MOCK_DATA.floors['2-qavat'];
      return (
        <div className="grid grid-cols-3 gap-6">
          {getFilteredRooms(floor2.rooms).map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
          {!isVenueBooked(floor2.ceremonyHall.id) || !showAvailableOnly ? (
            <RoomCard room={floor2.ceremonyHall} isLarge={true} />
          ) : null}
        </div>
      );
    }

    if (selectedFloor === '3-qavat') {
      const floor3 = MOCK_DATA.floors['3-qavat'];
      const filteredRooms = getFilteredRooms(floor3.rooms);
      const filteredTables = getFilteredTables(floor3.tables);
      
      return (
        <div className="space-y-8">
          {filteredRooms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Shaxsiy Xonalar</h3>
              <div className="grid grid-cols-3 gap-6">
                {filteredRooms.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>
          )}
          
          {filteredTables.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Asosiy Zal Stollari</h3>
              <div className="flex flex-wrap gap-8 justify-center">
                {filteredTables.map(table => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Booking Modal */}
      {showBookingModal && selectedSeating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-600 p-6">
              <h2 className="text-2xl font-bold text-white">Bron Qilish</h2>
              <p className="text-white/90 mt-1">{selectedSeating.name} • {guestCount} kishi</p>
            </div>
            
            <form onSubmit={submitBooking} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Sana</p>
                <p className="text-gray-900 font-bold text-lg">{selectedDateStr}</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Ismingiz</label>
                <input
                  type="text"
                  value={bookingForm.customerName}
                  onChange={(e) => setBookingForm({...bookingForm, customerName: e.target.value})}
                  placeholder="Ismingizni kiriting"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Telefon</label>
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  placeholder="+998 XX XXX XX XX"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Izoh (ixtiyoriy)</label>
                <textarea
                  value={bookingForm.comment}
                  onChange={(e) => setBookingForm({...bookingForm, comment: e.target.value})}
                  placeholder="Qo'shimcha izoh..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saqlanmoqda...' : 'Bron qilish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Stol Bron Qilish</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">MENYU</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">GALEREYA</a>
              <a href="#" className="text-red-600 font-medium border-b-2 border-red-600 pb-1">BRON QILISH</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">ALOQA</a>
            </nav>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Booking Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {/* SELECT DATE - rasmdagidek */}
          <div className="mb-6 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">SELECT DATE</h2>
              <div className="text-sm text-gray-500">October 24, 2023</div>
            </div>
            
            {/* Custom Date Picker Trigger */}
            <button
              onClick={toggleCalendar}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-between text-gray-900 font-medium hover:border-red-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-red-600" />
                <span>October {selectedDate}, 2023</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
            </button>

            {/* Calendar Popover */}
            {showCalendar && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Month Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <button className="p-1 rounded hover:bg-gray-200">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="font-medium text-gray-800">October 2023</span>
                  <button className="p-1 rounded hover:bg-gray-200">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 bg-white border-b border-gray-200">
                  {MOCK_DATA.calendarData.days.map(day => (
                    <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                {MOCK_DATA.calendarData.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7">
                    {week.map((date, dayIndex) => {
                      const isToday = date === MOCK_DATA.calendarData.today;
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
                            relative py-3 text-center text-sm border-r border-b border-gray-100 transition-all
                            ${!date ? 'bg-gray-50 cursor-default' : 'hover:bg-red-50 cursor-pointer'}
                            ${isSelected ? 'bg-red-600 text-white font-bold' : ''}
                            ${isToday && !isSelected ? 'bg-green-100 text-green-800 font-bold' : ''}
                            ${date && !isSelected && !isToday ? 'text-gray-800' : ''}
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
                      <span className="text-gray-600">High Availability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                      <span className="text-gray-600">TODAY</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 flex-wrap mt-6">
            {/* Time Selector */}
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs font-semibold text-gray-500 uppercase">Vaqtni tanlang</label>
              <select 
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 cursor-pointer hover:border-red-500 transition-all w-full font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {MOCK_DATA.timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Guest Count */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-semibold text-gray-500 uppercase">Mehmonlar</label>
              <select 
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 cursor-pointer hover:border-red-500 transition-all w-full font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
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
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Qavatni tanlang</h3>
              <div className="space-y-2">
                {['1-qavat', '2-qavat', '3-qavat'].map(floor => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium
                      ${selectedFloor === floor 
                        ? 'bg-red-50 text-red-600 shadow-md border-l-4 border-red-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedFloor === floor ? 'bg-red-600' : 'bg-gray-300'}`} />
                    {floor}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6">Sizning Tanlovingiz</h3>
              
              {selectedSeating ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Sana</span>
                    <span className="font-semibold text-gray-900">
                      October {selectedDate}, 2023
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Vaqt</span>
                    <span className="font-semibold text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Mehmonlar</span>
                    <span className="font-semibold text-gray-900">{guestCount} kishi</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">{(selectedSeating as SelectedSeating).type === 'table' ? 'Stol' : 'Xona'}</span>
                    <span className="font-semibold text-gray-900">{(selectedSeating as SelectedSeating).name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Qavat</span>
                    <span className="font-semibold text-gray-900">{(selectedSeating as SelectedSeating).floor}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 pb-4">
                    <span className="text-gray-600 text-sm font-medium">Sig'imi</span>
                    <span className="font-semibold text-gray-900">{(selectedSeating as SelectedSeating).capacity} kishi</span>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      10 000 so'm qaytarilmaydigan bron to'lovi yakuniy hisobga qo'shiladi.
                    </p>
                    
                    <button 
                      onClick={handleBookVenue}
                      disabled={isVenueBooked(selectedSeating.id)}
                      className={`w-full py-3.5 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl
                        ${isVenueBooked(selectedSeating.id) 
                          ? 'bg-red-500 text-white cursor-not-allowed' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
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
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm font-medium">Hali tanlov yo'q</p>
                  <p className="text-xs mt-2">Xaritadan xona yoki stol tanlang</p>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm p-6 border border-red-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                Bron qilish vaqti
              </h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex justify-between">
                  <span>Sana:</span>
                  <span className="font-medium">October {selectedDate}, 2023</span>
                </p>
                <p className="flex justify-between">
                  <span>Vaqt:</span>
                  <span className="font-medium">{selectedTime}</span>
                </p>
                <p className="flex justify-between">
                  <span>Mehmonlar:</span>
                  <span className="font-medium">{guestCount} kishi</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedFloor}</h2>
                  <p className="text-sm text-gray-500 mt-1">Quyidagi interaktiv xaritadan kerakli joyni tanlang.</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-green-500 bg-white" />
                    <span className="text-gray-600 font-medium">Bo'sh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600 border-2 border-green-700" />
                    <span className="text-gray-600 font-medium">Tanlandi</span>
                  </div>
                </div>
              </div>

              {renderFloorContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2024 Premium Ovqatlanish Guruhi. Barcha huquqlar himoyalangan.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gray-900 transition-colors">Maxfiylik Siyosati</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Foydalanish Shartlari</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Bekor Qilish Siyosati</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}