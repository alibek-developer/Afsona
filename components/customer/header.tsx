"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartSidebar } from "./cart-sidebar";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const itemCount = useCartStore((state) =>
    isMounted ? state.getItemCount() : 0,
  );
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const prevItemCount = useRef(itemCount);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && itemCount > prevItemCount.current) {
      setCartPulseKey((k) => k + 1);
    }
    prevItemCount.current = itemCount;
  }, [itemCount, isMounted]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMounted) return null;

  const isDark = resolvedTheme === "dark";

  const navLinks = [
    { href: "/", label: "Bosh sahifa" },
    { href: "/menu", label: "Menyu" },
    { href: "/reservations", label: "Stol band qilish" },
    { href: "/about", label: "Biz haqimizda" },
  ];

  return (
    <>
      {/* Dekorativ ustki chiziq */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

      <header className="sticky top-0 z-50 w-full transition-all duration-500">
        {/* Glassmorphism fon - scroll qilganda o'zgaradi */}
        <div
          className={`absolute top-0 left-0 right-0 h-16 md:h-20 transition-all duration-500 ${
            scrolled
              ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20"
              : "bg-white/70 dark:bg-slate-950/70 backdrop-blur-md"
          } border-b ${scrolled ? "border-red-200/50 dark:border-red-900/30" : "border-slate-200/30 dark:border-slate-800/30"}`}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - yanada jozibali */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-red-500/20 
                  border-2 border-gradient-to-br from-red-400 to-red-600 
                  group-hover:shadow-xl group-hover:shadow-red-500/40 transition-all"
              >
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/20 
                  group-hover:from-red-500/20 group-hover:to-red-500/40 transition-all"
                />
              </motion.div>

              <div className="flex flex-col">
                <span
                  className="font-black text-2xl tracking-tight bg-gradient-to-r from-red-600 to-red-700 
                  bg-clip-text text-transparent dark:from-red-400 dark:to-red-500"
                >
                  Afsona
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 -mt-1">
                  Milliy taomlar
                </span>
              </div>
            </Link>

            {/* Desktop Nav - yanada chiroyli */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={link.href} className="relative group">
                      <div
                        className={`
                        px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300
                        ${
                          isActive
                            ? "text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30"
                            : "text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
                        }
                      `}
                      >
                        {link.label}
                      </div>

                      {/* Hover effect - pastki chiziq */}
                      {!isActive && (
                        <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 
                    hover:text-red-600 dark:hover:text-red-400 transition-all"
                >
                  <AnimatePresence mode="wait">
                    {isDark ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Sun className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Moon className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Savatcha - yanada ta'sirchan */}
              <Sheet>
                <SheetTrigger asChild>
                  <div className="relative">
                    <motion.div
                      key={cartPulseKey}
                      animate={
                        itemCount > 0 && cartPulseKey > 0
                          ? {
                              y: [0, -10, 0],
                              rotate: [0, -12, 12, -6, 6, 0],
                              scale: [1, 1.1, 1],
                            }
                          : {}
                      }
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 
                          dark:from-red-950 dark:to-red-900 
                          hover:from-red-500 hover:to-red-600 hover:text-white 
                          transition-all duration-300 group shadow-md hover:shadow-xl
                          border border-red-200 dark:border-red-800"
                      >
                        <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />

                        {/* Pulse ring when items added */}
                        {itemCount > 0 && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-red-500"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.3, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </Button>
                    </motion.div>

                    {/* Badge - yanada chiroyli */}
                    <AnimatePresence>
                      {itemCount > 0 && (
                        <motion.div
                          initial={{ scale: 0, x: 10, y: -10 }}
                          animate={{ scale: 1, x: 0, y: 0 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-2 flex items-center justify-center 
                            bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-black rounded-full 
                            shadow-lg shadow-red-500/50 border-2 border-white dark:border-slate-950
                            pointer-events-none"
                        >
                          {itemCount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md p-0">
                  <CartSidebar />
                </SheetContent>
              </Sheet>

              {/* Mobile Menu Button */}
              <motion.div
                className="md:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-12 w-12 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <AnimatePresence mode="wait">
                    {mobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Menu - yanada chiroyli */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl 
                border-b border-red-200/50 dark:border-red-900/30 shadow-lg"
            >
              <div className="flex flex-col p-4 gap-2">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`
                          flex items-center gap-3 p-4 rounded-2xl text-base font-bold transition-all
                          ${
                            isActive
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"
                              : "text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20"
                          }
                        `}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Dekorativ element */}
                <div className="mt-2 pt-4 border-t border-red-200 dark:border-red-900/30">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Mazali taomlar, sifatli xizmat</span>
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
