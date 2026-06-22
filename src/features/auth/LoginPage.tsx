import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        toast.success('Berhasil login')
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal login, periksa kembali email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="flex flex-col items-center justify-center md:hidden mb-6">
        <Link to="/" className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
          <span className="font-extrabold text-2xl text-red-700 tracking-tight">KarangTaruna Bina Pemuda</span>
        </Link>
      </div>

      <Card className="border-none shadow-2xl shadow-red-900/10 rounded-[2rem] bg-white">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-extrabold text-zinc-900 tracking-tight">Login Panitia</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Akses dashboard admin dan bendahara.
          </CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@bina-pemuda.org" 
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required 
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold bg-red-700 hover:bg-red-800 shadow-lg shadow-red-700/20 mt-4" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? 'Memproses...' : 'Login Sekarang'}
          </Button>
        </form>
      </CardContent>
      </Card>
    </div>
  )
}
