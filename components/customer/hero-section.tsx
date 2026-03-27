"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingBag, Flame, Clock, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

const featuredDishes = [
  {
    id: 1,
    name: "Shohona Palov",
    description:
      "Lazer guruch, barra qo'y go'shti va bedana tuxumi bilan tayyorlangan maxsus bayram oshi.",
    price: "120 000 UZS",
    time: "20 min",
    calories: "850 kcal",
    image: "./dish-1.png",
    popular: true,
  },
  {
    id: 2,
    name: "Tandir Qovurg'a",
    description:
      "Archa shoxlari tutunida dimlab pishirilgan, og'izda eriydigan qo'y qovurg'alari.",
    price: "180 000 UZS",
    time: "35 min",
    calories: "920 kcal",
    image: "./dish-2.png",
    popular: false,
  },
  {
    id: 3,
    name: "Assorti Shashlik",
    description:
      "Qiyma, jaz, jigar va tovuq go'shtlaridan iborat 4 kishilik maxsus shashlik to'plami.",
    price: "150 000 UZS",
    time: "25 min",
    calories: "780 kcal",
    image: "./dish-3.png",
    popular: true,
  },
];

export function FeaturedMenuSection() {
  return (
    <section className="relative w-full py-24 bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* SARLAVHA (Hero uslubida) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <span className="text-red-600 font-black uppercase tracking-[0.2em] text-xs">
              Oshpaz tavsiyasi
            </span>
            <h2 className="text-5xl md:text-6xl font-[1000] text-slate-900 dark:text-white leading-[0.9] uppercase tracking-tighter">
              Eng ko'p <br />
              <span className="text-red-600">Buyurtma</span> <br />
              qilinganlar
            </h2>
          </motion.div>

          <Link
            href="/menu"
            className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white hover:text-red-600 transition-colors pb-2"
          >
            Barcha menyu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredDishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(220,38,38,0.1)] transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden m-4 rounded-[2rem]">
                {dish.popular && (
                  <div className="absolute top-4 left-4 z-10 bg-[#FF4D00] text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full shadow-lg flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-white" />
                    Top Tanlov
                  </div>
                )}
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Content */}
              <div className="px-8 pb-8 pt-2 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase leading-tight tracking-tight">
                      {dish.name}
                    </h3>
                    <span className="text-xl font-black text-red-600 whitespace-nowrap pt-1">
                      {dish.price.replace(" UZS", "")}
                      <span className="text-xs ml-1">UZS</span>
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-2">
                    {dish.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 py-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <Clock className="w-4 h-4 text-red-500" />
                    {dish.time}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {dish.calories}
                  </div>
                </div>

                {/* Button */}
                <Button className="w-full h-14 bg-[#0F172A] hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all duration-300 shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  Savatga qo'shish
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
