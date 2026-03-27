"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { useCartStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { MenuItem } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag, Clock, Flame, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function MenuCard({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flyData, setFlyData] = useState({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const addItem = useCartStore((state) => state.addItem);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    addItem(item);
    setAdded(true);
    const cartEl = document.querySelector("[data-cart-icon]");
    if (buttonRef.current && cartEl) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();
      setFlyData({
        x: btnRect.left + btnRect.width / 2,
        y: btnRect.top + btnRect.height / 2,
        targetX: cartRect.left + cartRect.width / 2,
        targetY: cartRect.top + cartRect.height / 2,
      });
      setIsFlying(true);
      setTimeout(() => setIsFlying(false), 900);
    }
    toast.success("Savatga qo'shildi!");
    setTimeout(() => setAdded(false), 2000);
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-full w-full"
    >
      <Card
        className="group relative flex h-full flex-col overflow-hidden border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 rounded-[2.5rem] p-0 transition-all duration-500 ease-out
        shadow-[0_20px_50px_rgba(0,0,0,0.04)]
        hover:-translate-y-2
        hover:shadow-[0_40px_80px_rgba(220,38,38,0.1)]"
      >
        {/* Rasm qismi - Konteyner ichida kichraytirilgan */}
        <div className="relative aspect-[4/3] overflow-hidden m-4 rounded-[2rem] shrink-0">
          {/* Top Tanlov Badge - Narxga qarab avtomatik chiqadi yoki item.popular bo'lsa */}
          {item.price > 120000 && (
            <div className="absolute top-4 left-4 z-10 bg-[#FF4D00] text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full shadow-lg flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-white" />
              Top Tanlov
            </div>
          )}

          <Image
            src={item.image_url || "/placeholder.svg"}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
        </div>

        {/* Ma'lumotlar qismi */}
        <div className="flex flex-1 flex-col px-8 pb-8 pt-2">
          <div className="mb-4">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase leading-tight tracking-tight transition-colors group-hover:text-red-600">
                {item.name}
              </h3>
              <Price
                value={item.price}
                className="text-xl font-black text-red-600 whitespace-nowrap pt-1"
              />
            </div>
            {/* Description qismi qo'shildi */}
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-2">
              Mazali va yangi masalliqlardan tayyorlangan shohona lazzat.
            </p>
          </div>

          {/* Vaqt va Kaloriya - Dizaynga ko'ra */}
          <div className="flex items-center gap-6 py-4 border-t border-slate-50 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Clock className="w-4 h-4 text-red-500" />
              25-30 min
            </div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Flame className="w-4 h-4 text-orange-500" />
              850 kcal
            </div>
          </div>

          {/* Asosiy Tugma */}
          <Button
            ref={buttonRef}
            onClick={handleAddToCart}
            className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all duration-500 shadow-xl active:scale-95 flex items-center gap-3 ${
              added
                ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/20"
                : "bg-[#0F172A] text-white hover:bg-red-600 shadow-slate-200 dark:shadow-none"
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-5 w-5 stroke-[3]" />
                  Qo'shildi
                </motion.div>
              ) : (
                <motion.div
                  key="bag"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5 stroke-[2.5]" />
                  Savatga qo'shish
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </Card>

      {/* Fly Animation Portal - Mantiq saqlangan */}
      {isFlying &&
        createPortal(
          <motion.div
            initial={{
              x: flyData.x - 24,
              y: flyData.y - 24,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: flyData.targetX - 24,
              y: flyData.targetY - 24,
              scale: 0.1,
              opacity: 0,
              rotate: 360,
            }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 z-[9999] pointer-events-none"
          >
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] border-2 border-white">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
          </motion.div>,
          document.body,
        )}
    </motion.div>
  );
}
