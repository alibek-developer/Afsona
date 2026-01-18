"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate email is authorized before attempting login
      const allowedEmails = ['a1ibekdew0@gmail.com', 'inoqdost478@gmail.com']
      if (!allowedEmails.includes(email.toLowerCase().trim())) {
        throw new Error("Noto'g'ri login yoki parol")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        // Show Uzbek error for invalid credentials
        throw new Error("Noto'g'ri login yoki parol")
      }

      if (!data.user) {
        throw new Error("Noto'g'ri login yoki parol")
      }

      // Double-check the email matches what we expect
      const userEmail = data.user.email?.toLowerCase().trim()
      
      // Wait a moment for session to be set in cookies
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (userEmail === 'a1ibekdew0@gmail.com') {
        window.location.href = '/admin/buyurtmalar'
      } else if (userEmail === 'inoqdost478@gmail.com') {
        window.location.href = '/call-center'
      } else {
        throw new Error("Noto'g'ri login yoki parol")
      }

    } catch (err: any) {
      setError(err.message || "Noto'g'ri login yoki parol")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Tizimga kirish</CardTitle>
          <CardDescription className="text-center">
            Restoran boshqaruv tizimi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Kirish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
