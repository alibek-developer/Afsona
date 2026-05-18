'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Users,
  Minus,
  Plus,
  Wifi,
  Tv,
  Snowflake,
  Check,
  ArrowRight,
  ChevronDown,
  X,
  MapPin,
  Phone,
  Clock,
  Send,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';

// ---------- Interfaces & Data ----------
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

interface TableItem {
  id: string;
  name: string;
  capacity: number;
  price_per_hour: number;
  is_available: boolean;
  image_url: string;
  floor: string;
  type?: string;
  active_order?: Order | null;
}

const TIME_SLOTS = [
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

const ROOMS_GALLERY = [
  {
    id: "vip",
    name: "VIP Xona",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    capacity: "2–8 mehmon",
    price: "500,000 soʻmdan",
    amenities: ["wifi", "tv", "ac"] as const,
    desc: "Yopiq, pardalar bilan ajratilgan VIP zona. Maxsus xizmat va shaxsiy ofitsiant. Tugʻilgan kun, nikoh oqshomi va biznes uchrashuvlar uchun ideal.",
  },
  {
    id: "main",
    name: "Asosiy Zal",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
    capacity: "10–60 mehmon",
    price: "200,000 soʻmdan",
    amenities: ["wifi", "ac"] as const,
    desc: "Restoranning yuragi — baland shiftli, hashamatli zal. Katta oilaviy yigʻinlar va tantanali kechalar uchun.",
  },
  {
    id: "terrace",
    name: "Ochiq Terassa",
    img: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=800",
    capacity: "4–20 mehmon",
    price: "250,000 soʻmdan",
    amenities: ["wifi"] as const,
    desc: "Yulduzlar ostida kechki ovqat. Bogʻ manzarali ochiq havoli terassa, gulchamandagi tunlar uchun.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

function amenityIcon(a: string) {
  if (a === "wifi") return <Wifi className="h-3.5 w-3.5" />;
  if (a === "tv") return <Tv className="h-3.5 w-3.5" />;
  return <Snowflake className="h-3.5 w-3.5" />;
}

// ---------- Custom Calendar Component ----------
function MiniCalendar({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const [view, setView] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthName = view.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });
  const firstDay = new Date(view.getFullYear(), view.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon-first
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          className="grid h-9 w-9 place-items-center rounded-xl border border-border transition hover:bg-muted dark:hover:bg-slate-800"
        >
          <span className="text-lg">‹</span>
        </button>
        <div className="font-display text-base font-bold capitalize tracking-tight">{monthName}</div>
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          className="grid h-9 w-9 place-items-center rounded-xl border border-border transition hover:bg-muted dark:hover:bg-slate-800"
        >
          <span className="text-lg">›</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
        {["Du","Se","Cho","Pa","Ju","Sh","Ya"].map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const disabled = d < today;
          const selected = d.toDateString() === value.toDateString();
          const isToday = d.toDateString() === today.toDateString();
          return (
            <button
              key={`day-${i}`}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              className={`aspect-square rounded-xl text-sm transition relative font-semibold flex items-center justify-center
                ${disabled ? 'text-muted-foreground/30 cursor-not-allowed bg-transparent' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                ${selected ? 'bg-red-600 text-white hover:bg-red-600 font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)]' : ''}
                ${isToday && !selected ? 'border border-red-500/50 text-red-500' : ''}
              `}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Table Design Renderers ----------
function renderTableIcon(isOccupied: boolean, isSelected: boolean, isVIP: boolean, capacity: number) {
  const tableColor = isSelected ? 'bg-red-600' : isOccupied ? 'bg-red-400 dark:bg-red-500/50' : isVIP ? 'bg-[#986A2E]' : 'bg-[#D2A679]';
  const chairColor = isSelected ? 'bg-red-200 dark:bg-red-800' : isOccupied ? 'bg-red-200 dark:bg-red-950/40' : isVIP ? 'bg-[#EAE0D5]' : 'bg-[#EAE0D5]';
  
  const isRoom = capacity > 4;

  return (
    <div className="relative w-[80px] h-[70px] mx-auto mt-2 mb-4 flex items-center justify-center">
      {isRoom ? (
         <>
          {/* VIP / ROOM Layout */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1.5">
              <div className={`w-3.5 h-2.5 rounded-t-sm ${chairColor}`} />
              <div className={`w-3.5 h-2.5 rounded-t-sm ${chairColor}`} />
              <div className={`w-3.5 h-2.5 rounded-t-sm ${chairColor}`} />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5">
              <div className={`w-3.5 h-2.5 rounded-b-sm ${chairColor}`} />
              <div className={`w-3.5 h-2.5 rounded-b-sm ${chairColor}`} />
              <div className={`w-3.5 h-2.5 rounded-b-sm ${chairColor}`} />
          </div>
          <div className={`w-[60px] h-12 rounded-lg ${tableColor} z-10 flex flex-col items-center justify-start pt-1 shadow-sm`}>
             {isVIP && !isSelected && <span className="text-white/80 text-[8px] font-black tracking-widest mt-1">VIP</span>}
          </div>
         </>
      ) : (
         <>
          {/* STANDARD TABLE Layout */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-1">
              <div className={`w-5 h-2 rounded-t-md ${chairColor}`} />
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              <div className={`w-5 h-2 rounded-b-md ${chairColor}`} />
          </div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2">
              <div className={`w-2 h-5 rounded-l-md ${chairColor}`} />
          </div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <div className={`w-2 h-5 rounded-r-md ${chairColor}`} />
          </div>
          <div className={`w-[46px] h-[46px] rounded-[14px] ${tableColor} z-10 flex items-center justify-center shadow-sm`}>
             {isVIP && !isSelected && <span className="text-white/80 text-[8px] font-black tracking-widest relative -top-2">VIP</span>}
          </div>
         </>
      )}
    </div>
  );
}

// ---------- Main Page Component ----------
export default function RestaurantReservation() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  });
  
  // Format selected date to YYYY-MM-DD
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [selectedTime, setSelectedTime] = useState('19:00');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedFloor, setSelectedFloor] = useState('1-qavat');
  
  // Database Tables State
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeating, setSelectedSeating] = useState<TableItem | null>(null);
  const [bookedVenues, setBookedVenues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<(any) | null>(null);
  
  // Filters
  const [seatingFilter, setSeatingFilter] = useState<'all' | 'xona' | 'stol'>('all');
  
  // Form State
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    phone: '',
    comment: ''
  });

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);

  // Modal Spaces detail view
  const [openSpaceId, setOpenSpaceId] = useState<string | null>(null);

  // ---------- Supabase Logic & Side Effects ----------
  
  // Fetch booked venues for the selected date & time slot
  const fetchBookedVenues = async () => {
    try {
      const formattedTime = selectedTime.includes(':') && selectedTime.split(':').length === 2 
        ? `${selectedTime}:00` 
        : selectedTime;

      const { data, error } = await supabase
        .from('table_reservations')
        .select('table_id')
        .eq('reservation_date', selectedDateStr)
        .eq('start_time', formattedTime)
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;
      setBookedVenues(data?.map(r => r.table_id) || []);
    } catch (err: any) {
      console.error('Error fetching booked venues:', err);
    }
  };

  // Fetch Tables & Active Orders from database
  const fetchTables = async () => {
    try {
      setLoading(true);
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false });

      if (tablesError) throw tablesError;

      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'active');

      if (ordersError) throw ordersError;

      const tablesWithStatus = (tablesData || []).map((table: TableItem) => {
        const activeOrder = activeOrders?.find((order: Order) => order.table_id === table.id);
        return {
          ...table,
          is_available: !activeOrder,
          active_order: activeOrder || null
        };
      });

      setTables(tablesWithStatus);
      
      // Auto-assign active floor based on current table data
      const floors = Array.from(new Set(tablesWithStatus.map(t => t.floor))).sort();
      if (floors.length > 0 && !floors.includes(selectedFloor)) {
        setSelectedFloor(floors[0]);
      }
    } catch (err: any) {
      console.error('Error loading restaurant map:', err);
      toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedVenues();
  }, [selectedDateStr, selectedTime]);

  useEffect(() => {
    fetchTables();

    // Setup real-time Supabase subscriptions to refresh seats dynamically
    const subscription = supabase
      .channel('tables-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchTables();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update selected Date state and format string
  const handleDateChange = (d: Date) => {
    setSelectedDate(d);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDateStr(`${year}-${month}-${day}`);
  };

  const isVenueBooked = (id: string) => bookedVenues.includes(id);

  const handleSeatingClick = (item: TableItem) => {
    const isOccupied = !item.is_available || isVenueBooked(item.id);
    if (isOccupied) {
      toast.error('Kechirasiz, bu stol ayni vaqtda band!');
      return;
    }
    setSelectedSeating(item);
  };

  // Submit Booking Form to Supabase
  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.customerName.trim() || !bookingForm.phone.trim()) {
      toast.error('Iltimos, ismingiz va telefon raqamingizni toʻliq kiriting');
      return;
    }
    if (!selectedSeating) {
      toast.error('Iltimos, bron qilish uchun avval xona yoki stol tanlang');
      return;
    }

    setIsSubmitting(true);
    try {
      // Load first branch to get branch_id dynamically
      const { data: branches, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .limit(1);

      if (branchError || !branches || branches.length === 0) {
        throw new Error('Hech qaysi filial topilmadi.');
      }
      const branchId = branches[0].id;

      const newRef = "AFN-" + Math.floor(1000 + Math.random() * 9000);

      const { error } = await supabase.from('table_reservations').insert({
        branch_id: branchId,
        table_id: selectedSeating.id,
        customer_name: bookingForm.customerName.trim(),
        phone: '+998' + bookingForm.phone.trim(),
        reservation_date: selectedDateStr,
        people_count: guestCount,
        start_time: selectedTime + ':00',
        end_time: '23:00:00',
        notes: bookingForm.comment.trim() || null,
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Broningiz muvaffaqiyatli qabul qilindi!');
      
      // Save info for success popup
      setSuccessBooking({
        ref: newRef,
        date: selectedDate,
        time: selectedTime,
        guests: guestCount,
        roomName: selectedSeating.name
      });
      
      // Refresh booked seats list
      setBookedVenues(prev => [...prev, selectedSeating.id]);
    } catch (err: any) {
      console.error('Error inserting booking:', err);
      toast.error('Bron qilishda xatolik yuz berdi. Iltimos keyinroq qayta urinib koʻring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeFloors = Array.from(new Set(tables.map(t => t.floor))).sort();

  const filteredTables = useMemo(() => {
    return tables
      .filter(item => item.floor === selectedFloor)
      .filter(item => {
        if (seatingFilter === 'all') return true;
        const type = item.type === 'xona' || (item.capacity > 4 && !item.type) ? 'xona' : 'stol';
        return type === seatingFilter;
      });
  }, [tables, selectedFloor, seatingFilter]);

  const scrollToBook = (floorName?: string) => {
    if (floorName) {
      const dbFloor = activeFloors.find(f => f.toLowerCase().includes(floorName.toLowerCase()) || floorName.toLowerCase().includes(f.toLowerCase()));
      if (dbFloor) setSelectedFloor(dbFloor);
    }
    setTimeout(() => {
      document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const selectedSpaceDetail = ROOMS_GALLERY.find(x => x.id === openSpaceId);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300">
      <Toaster position="top-center" />

      {/* ---------- Parallax Hero Section ---------- */}
      <section ref={heroRef} className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1600"
            alt="Afsona Fine Dining Restaurant"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-slate-50 dark:to-[#020617]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 via-transparent to-transparent" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center text-white max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase font-semibold tracking-[0.2em] backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Toshkentning eng nufuzli restorani
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 font-display text-5xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Siz uchun maxsus
            <br />
            <span className="bg-gradient-to-r from-white via-white to-red-500 bg-clip-text text-transparent italic">
              shinam maskan
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl text-slate-300 text-base sm:text-lg font-medium"
          >
            Anʼanaviy mehmondoʻstlik va yuksak nafosat uygʻunligi. Kafolatlangan va shinam kechalar uchun stol yoki VIP xonani hoziroq band qiling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row w-full justify-center"
          >
            <button
              onClick={() => scrollToBook()}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-8 py-4.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all hover:scale-105"
            >
              Stol band qilish
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/5 hover:bg-white/10 px-8 py-4.5 text-sm font-black uppercase tracking-widest text-white backdrop-blur transition-all"
            >
              Menyuni koʻrish
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <a href="#reservation" className="flex flex-col items-center gap-2 text-white/50 transition hover:text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pastga siljiting</span>
            <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
              <ChevronDown className="h-5 w-5" />
            </motion.span>
          </a>
        </motion.div>
      </section>

      {/* ---------- Reservation Stepper Section ---------- */}
      <section id="reservation" className="relative px-6 py-24 sm:py-32 w-full max-w-7xl mx-auto">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="mb-14 text-center space-y-3">
            <span className="text-xs uppercase font-black tracking-[0.35em] text-red-600">Buyurtma berish</span>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl md:text-6xl">Stol band qilish</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400 font-medium">
              Uch oddiy qadamda restoranimizdan shaxsiy joyingizni band qiling. Savollaringiz bo'lsa biz doimo xizmatingizdamiz.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="card-premium rounded-[2.5rem] bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-2xl dark:shadow-[0_0_50px_rgba(239,68,68,0.05)] sm:p-10"
          >
            {/* Stepper Steps UI */}
            <div className="mb-8 flex items-center justify-between max-w-xl mx-auto">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    onClick={() => {
                      if (n < step) setStep(n);
                    }}
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black transition-all duration-300 border
                      ${step >= n
                        ? 'border-red-600 bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 bg-transparent'
                      }
                    `}
                  >
                    {step > n ? <Check className="h-4 w-4 stroke-[3]" /> : n}
                  </button>
                  {n < 3 && (
                    <div className={`mx-3 h-[2px] flex-1 rounded-full transition-all duration-500
                      ${step > n ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-800'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="mb-10 flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 max-w-xl mx-auto px-1">
              <span className={step === 1 ? "text-red-500 dark:text-red-400" : ""}>Sana va vaqt</span>
              <span className={step === 2 ? "text-red-500 dark:text-red-400" : ""}>Xona va Stol</span>
              <span className={step === 3 ? "text-red-500 dark:text-red-400" : ""}>Maʻlumotlar</span>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: Date, Time & Guests selection */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left: Monthly Calendar */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sana tanlang</span>
                      <MiniCalendar value={selectedDate} onChange={handleDateChange} />
                    </div>

                    {/* Right: Time slots & Guests */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tashrif vaqti</span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                          {TIME_SLOTS.map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSelectedTime(t)}
                              className={`rounded-xl border py-3 text-xs font-bold transition-all duration-200
                                ${selectedTime === t
                                  ? 'border-red-600 bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-red-500/50'
                                }
                              `}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mehmonlar soni</span>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 p-2.5 h-16">
                          <div className="flex items-center gap-3 pl-3">
                            <Users className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-bold text-slate-500">Mehmonlar</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition hover:border-red-500/60 font-black text-red-500 text-lg shadow-sm"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center text-xl font-black tabular-nums">{guestCount}</span>
                            <button
                              type="button"
                              onClick={() => setGuestCount(Math.min(40, guestCount + 1))}
                              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition hover:border-red-500/60 font-black text-red-500 text-lg shadow-sm"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 py-4.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.25)] transition-all hover:scale-[1.01]"
                  >
                    Davom etish <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Interactive Table Grid / Floor Plan */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Joy tanlash</span>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        Xona va stollar xaritasi
                      </h3>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Floor Tabs */}
                      <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 overflow-x-auto hide-scrollbar">
                        {activeFloors.length > 0 ? (
                          activeFloors.map(floor => {
                            const isVIP = floor.toLowerCase().includes('vip');
                            return (
                              <button
                                key={floor}
                                type="button"
                                onClick={() => setSelectedFloor(floor)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase whitespace-nowrap transition-all
                                  ${selectedFloor === floor
                                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-white shadow-sm font-bold'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-transparent'
                                  }
                                `}
                              >
                                {isVIP && <span className="text-yellow-500 mr-1">★</span>}
                                {floor}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-6 py-2.5 text-xs font-black tracking-widest uppercase text-slate-400">
                            1-QAVAT
                          </div>
                        )}
                      </div>

                      {/* Seating type filters */}
                      <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-950">
                        {[
                          { id: 'all', label: 'Barchasi' },
                          { id: 'xona', label: 'Xonalar' },
                          { id: 'stol', label: 'Stollar' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSeatingFilter(tab.id as any)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                              ${seatingFilter === tab.id
                                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-500 shadow-sm'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                              }
                            `}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floor Map Layout */}
                  {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joylar yuklanmoqda...</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredTables.map(item => {
                          const isSelected = selectedSeating?.id === item.id;
                          const isOccupied = !item.is_available || isVenueBooked(item.id);
                          const isVIP = !!(item.name.toLowerCase().includes('vip') || (item.floor && item.floor.includes('VIP')));
                          const isRoom = item.type === 'xona' || (item.capacity > 4 && !item.type);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSeatingClick(item)}
                              disabled={isOccupied}
                              className={`relative w-full py-8 px-2 transition-all flex flex-col items-center justify-center border-2 bg-card rounded-3xl
                                ${isOccupied
                                  ? 'opacity-55 cursor-not-allowed border-transparent'
                                  : 'cursor-pointer hover:scale-[1.03] hover:border-red-500/40 active:scale-95 border-transparent'
                                }
                                ${isSelected ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.15)] ring-2 ring-red-600/20' : ''}
                              `}
                            >
                              <div className="relative">
                                {renderTableIcon(isOccupied, isSelected, isVIP, item.capacity)}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[10px] z-20 min-w-[58px] px-2.5 py-1 rounded-lg text-white font-black text-[10px] shadow-lg truncate max-w-[85px] border border-white/20
                                  ${isSelected ? 'bg-red-600' : isOccupied ? 'bg-red-400' : isVIP ? 'bg-[#986A2E]' : 'bg-[#D2A679]'}
                                `}>
                                  {item.name}
                                </div>
                              </div>

                              <div className="mt-7 text-center space-y-1">
                                <p className={`text-[10px] font-black uppercase tracking-widest
                                  ${isSelected ? 'text-red-500' : isOccupied ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}
                                `}>
                                  {isSelected ? 'Tanlandi' : isOccupied ? 'Band' : "Bo'sh"}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{item.capacity} kishi</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {filteredTables.length === 0 && (
                        <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                          <AlertCircle className="w-8 h-8 opacity-70" />
                          <span className="font-black uppercase tracking-widest text-xs">Bu filtrga mos keladigan joylar mavjud emas</span>
                        </div>
                      )}

                      {/* Map Legends */}
                      <div className="mt-8 pt-6 flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest justify-center border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#D2A679]" />
                          <span>Bo'sh Stol</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#986A2E]" />
                          <span>Bo'sh VIP Xona</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-400" />
                          <span>Band joy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-600" />
                          <span>Siz tanlagan joy</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 py-4 text-sm font-black uppercase tracking-widest transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    >
                      Orqaga
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!selectedSeating}
                      className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.25)] transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Davom etish <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Confirm form with Summary sidebar */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8 md:grid-cols-[1fr_300px]"
                >
                  <form onSubmit={submitBooking} className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Shaxsiy ma'lumotlar</span>
                      <h3 className="text-xl font-bold">Tashrifni tasdiqlang</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ismingiz</label>
                        <input
                          type="text"
                          required
                          value={bookingForm.customerName}
                          onChange={e => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                          placeholder="Masalan: Alibek Karimov"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Telefon raqamingiz</label>
                        <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 focus-within:border-red-500 transition-all">
                          <span className="grid place-items-center border-r border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40 px-4 text-sm font-bold text-slate-400">+998</span>
                          <input
                            type="tel"
                            required
                            value={bookingForm.phone}
                            onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value.replace(/\D/g, '').substring(0, 9) })}
                            placeholder="90 123 45 67"
                            className="flex-1 bg-transparent px-4 py-3.5 text-sm font-medium outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Maxsus tilaklar (ixtiyoriy)</label>
                        <textarea
                          rows={4}
                          value={bookingForm.comment}
                          onChange={e => setBookingForm({ ...bookingForm, comment: e.target.value })}
                          placeholder="Masalan: tugʻilgan kun, deraza yonidagi stol, bolalar stulchasi..."
                          className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 py-4 text-sm font-black uppercase tracking-widest transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      >
                        Orqaga
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedSeating}
                        className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.25)] transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Bron qilish <Sparkles className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Right Sidebar Booking Summary */}
                  <aside className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 p-6 space-y-5 h-fit">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Buyurtma xulosasi</div>
                    
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400 font-medium">Sana</span>
                        <span className="font-bold">{selectedDate.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" })}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400 font-medium">Vaqt</span>
                        <span className="font-bold">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400 font-medium">Qavat / Joy</span>
                        <span className="font-bold">{selectedSeating?.name} ({selectedSeating?.floor})</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400 font-medium">Mehmonlar</span>
                        <span className="font-bold">{guestCount} kishi</span>
                      </div>
                      {selectedSeating?.price_per_hour ? (
                        <div className="flex justify-between py-3">
                          <span className="text-slate-400 font-medium">Zaxira narxi</span>
                          <span className="font-black text-red-500">
                            {selectedSeating.price_per_hour.toLocaleString()} soʻm
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 p-3.5 flex items-start gap-2.5">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500/90 leading-normal">
                        Restoranimiz qoidalari bo'yicha bron qilingan vaqtdan keyin 15 daqiqadan ko'p kechikilsa, buyurtma bekor qilinishi mumkin.
                      </p>
                    </div>
                  </aside>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ---------- bottom Spaces Overview Section ---------- */}
      <section id="rooms" className="px-6 py-24 bg-white dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900/60">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="mb-14 text-center space-y-3">
            <span className="text-xs uppercase font-black tracking-[0.35em] text-red-600">Zallarimiz</span>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl md:text-6xl">Bizning xonalarimiz</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400 font-medium">
              Sizga va mehmonlaringizga mos keladigan o'ziga xos dizayn va atmosferaga ega zallarimiz bilan tanishing.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {ROOMS_GALLERY.map((room, i) => (
              <motion.article
                key={room.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 } as any}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 shadow-sm"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={room.img}
                    alt={room.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 space-y-3 text-white">
                    <h3 className="font-display text-2xl font-black uppercase tracking-tight">{room.name}</h3>
                    <div className="text-xs font-bold text-white/70">{room.capacity} · {room.price}</div>
                    
                    <button
                      type="button"
                      onClick={() => setOpenSpaceId(room.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-widest backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                    >
                      Batafsil <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Space Detail modal ---------- */}
      <Modal open={!!selectedSpaceDetail} onClose={() => setOpenSpaceId(null)}>
        {selectedSpaceDetail && (
          <div className="overflow-hidden">
            <div className="relative h-64 overflow-hidden sm:h-80">
              <img
                src={selectedSpaceDetail.img}
                alt={selectedSpaceDetail.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-1">
                <h3 className="font-display text-3xl font-black uppercase tracking-tight">{selectedSpaceDetail.name}</h3>
                <div className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  {selectedSpaceDetail.capacity} · {selectedSpaceDetail.price}
                </div>
              </div>
              
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                {selectedSpaceDetail.desc}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedSpaceDetail.amenities.map(a => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2 text-xs font-bold text-slate-500 capitalize"
                  >
                    {amenityIcon(a)}
                    <span>
                      {a === "ac" ? "Konditsioner" : a === "tv" ? "TV ekran" : "Tezkor Wi-Fi"}
                    </span>
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenSpaceId(null);
                  scrollToBook(selectedSpaceDetail.name);
                }}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(239,68,68,0.25)] transition-all hover:scale-[1.01]"
              >
                Bron qilish <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Success Modal ---------- */}
      <Modal open={!!successBooking} onClose={() => setSuccessBooking(null)}>
        {successBooking && (
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-[2.5]" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-black uppercase tracking-tight">Broningiz tasdiqlandi! 🎉</h3>
              <p className="text-sm font-medium text-slate-400">Restoranimizda sizni intiqlik bilan kutamiz</p>
            </div>

            <div className="inline-block rounded-full border border-red-500/30 bg-red-50 dark:bg-red-950/25 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-500">
              KOD: #{successBooking.ref}
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 text-left text-sm space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Sana</span>
                <span className="font-bold">{successBooking.date.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Vaqt</span>
                <span className="font-bold">{successBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Xona / Stol</span>
                <span className="font-bold">{successBooking.roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Mehmonlar</span>
                <span className="font-bold">{successBooking.guests} kishi</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessBooking(null);
                setStep(1);
                setSelectedSeating(null);
                setBookingForm({ customerName: '', phone: '', comment: '' });
              }}
              className="w-full rounded-2xl bg-red-600 hover:bg-red-700 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(239,68,68,0.25)] transition-all hover:scale-[1.01]"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        )}
      </Modal>
    </main>
  );
}

// ---------- Primitive Custom Modal ----------
function Modal({
  open,
  onClose,
  children,
  maxWidth = "max-w-lg"
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            className={`relative w-full overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl ${maxWidth}`}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}