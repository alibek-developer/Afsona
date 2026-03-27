"use client";

import { FeaturedDishes } from "@/components/customer/featured-dishes";
import { FeaturedMenuSection } from "@/components/customer/hero-section";
import { CheckCircle2, Smartphone, ArrowRight } from "lucide-react";

export default function HomePage() {
  const benefits = [
    "Tezkor buyurtma",
    "Maxsus chegirmalar",
    "Buyurtma tarixi",
    "Jonli kuzatish",
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617]">
      <FeaturedMenuSection />
      <FeaturedDishes />

      <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
        {/* Orqa fondagi bezaklar */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-red-50 dark:bg-red-950/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-slate-50 dark:bg-slate-900/30 rounded-full blur-3xl opacity-50" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="bg-slate-50 dark:bg-[#0f172a] rounded-[3rem] p-8 md:p-16 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-[0_0_40px_rgba(239,68,68,0.1)] transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Matn qismi */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-widest">
                    <Smartphone size={14} />
                    Mobil Ilova
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                    Buyurtma berish <br />
                    <span className="text-red-600 dark:text-red-500">
                      yanada oson!
                    </span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                    Bizning mobil ilovamizni yuklab oling va har bir buyurtmadan
                    eksklyuziv chegirmalarga ega bo'ling. Endi ilovamiz
                    <span className="font-bold text-slate-900 dark:text-white">
                      {" "}
                      Google Play
                    </span>
                    -da mavjud!
                  </p>
                </div>

                {/* Afzalliklar ro'yxati */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((text) => (
                    <div
                      key={text}
                      className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm"
                    >
                      <CheckCircle2
                        size={18}
                        className="text-red-600 dark:text-red-500"
                      />
                      {text}
                    </div>
                  ))}
                </div>

                {/* Play Market tugmasi */}
                <div className="pt-4">
                  <a
                    href="https://play.google.com/store/apps/details?id=YOUR_APP_PACKAGE_NAME" // Bu yerga ilova linkini qo'yasiz
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group relative inline-flex items-center gap-5 
                      bg-[#0f172a] dark:bg-slate-900 
                      text-white px-8 py-5 rounded-2xl 
                      transition-all duration-300 ease-out
                      hover:bg-black hover:-translate-y-1 active:translate-y-0
                      shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
                      dark:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.2)]
                      hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,0.4)]
                    "
                  >
                    {/* Google Play Ikonkasi */}
                    <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-white/20 transition-colors">
                      <svg
                        className="w-8 h-8"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.5 1.5C3.33333 1.5 3.16667 1.58333 3.08333 1.75L12.5 11.1667L15.3333 8.33333L3.5 1.5Z"
                          fill="#3BCCFF"
                        />
                        <path
                          d="M20.5 12C20.5 11.5833 20.3333 11.25 20.0833 11L16.8333 9.16667L13.8333 12.1667L16.8333 15.1667L20.0833 13.3333C20.3333 13.0833 20.5 12.6667 20.5 12.25V12Z"
                          fill="#FFD400"
                        />
                        <path
                          d="M3.08333 22.25C3.16667 22.4167 3.33333 22.5 3.5 22.5L15.3333 15.6667L12.5 12.8333L3.08333 22.25Z"
                          fill="#FF3333"
                        />
                        <path
                          d="M2.5 1.91667V22.0833L11.5 13.0833L2.5 1.91667V1.91667Z"
                          fill="#48FF48"
                        />
                      </svg>
                    </div>

                    {/* Matn qismi */}
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 leading-none mb-1">
                        Yuklab oling
                      </p>
                      <p className="text-xl font-black uppercase tracking-tight leading-none">
                        Google Play
                      </p>
                    </div>

                    <ArrowRight
                      size={22}
                      className="ml-2 group-hover:translate-x-2 transition-transform opacity-40 group-hover:opacity-100"
                    />
                  </a>
                </div>
              </div>

              {/* O'ng taraf - Telefon maketi (O'zgarmadi) */}
              <div className="relative hidden lg:flex justify-center">
                <div className="w-64 h-[500px] bg-slate-900 dark:bg-slate-800 rounded-[3rem] border-[8px] border-slate-800 dark:border-slate-700 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 dark:bg-slate-700 rounded-b-2xl" />
                  <div className="p-4 pt-12 space-y-4">
                    <div className="h-32 bg-red-600 rounded-2xl animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-3/4" />
                      <div className="h-4 bg-slate-700 rounded w-1/2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-20 bg-slate-800 rounded-xl border border-slate-700" />
                      <div className="h-20 bg-slate-800 rounded-xl border border-slate-700" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-4 right-4 h-12 bg-red-600 rounded-xl flex items-center justify-center font-black text-white text-xs uppercase">
                    Buyurtma berish
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-red-600 rounded-3xl -z-10 rotate-12 flex items-center justify-center text-white font-black text-2xl shadow-xl border-4 border-white dark:border-slate-900">
                  -20%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
