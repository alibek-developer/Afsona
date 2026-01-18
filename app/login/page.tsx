"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { Loader2, LockKeyhole, Mail, Utensils } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const allowedEmails = ['a1ibekdew0@gmail.com', 'inoqdost478@gmail.com']
      if (!allowedEmails.includes(email.toLowerCase().trim())) {
        throw new Error("Ruxsat etilmagan foydalanuvchi")
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError || !data.user) {
        throw new Error("Email yoki parol noto'g'ri")
      }

      const userEmail = data.user.email?.toLowerCase().trim()
      
      // Kichik kechikish sessiya to'liq o'rnatilishi uchun
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (userEmail === 'a1ibekdew0@gmail.com') {
        window.location.href = '/admin/buyurtmalar'
      } else if (userEmail === 'inoqdost478@gmail.com') {
        window.location.href = '/call-center'
      } else {
        throw new Error("Sizning rolingiz aniqlanmadi")
      }

    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] font-sans antialiased p-4">
      <Card className="w-full max-w-[440px] border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] bg-white overflow-hidden p-4">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-200 text-white mb-2">
            <Utensils size={32} />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
            Tizimga Kirish
          </CardTitle>
          <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            Restoran Boshqaruv Platformasi
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-red-100 bg-red-50 text-red-600 font-bold">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">
                Elektron pochta
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-500 font-bold text-slate-700 transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">
                Parol
              </Label>
              <div className="relative group">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-500 font-bold text-slate-700 transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "KIRISH"
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Xavfsiz ulanish yoqilgan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}