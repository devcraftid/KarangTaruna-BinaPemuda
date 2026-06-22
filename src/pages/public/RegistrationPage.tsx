import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Users, Trophy, Menu } from 'lucide-react'
import { registerParticipant } from '@/features/competitions/api'

export default function RegistrationPage() {
  const [searchParams] = useSearchParams()
  const initialLomba = searchParams.get('lomba')
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    competition_id: initialLomba || ''
  })

  const { data: competitions } = useQuery({
    queryKey: ['competitions-public'],
    queryFn: async () => {
      const { data } = await supabase.from('competitions').select('*, participants(id)')
      return data || []
    }
  })

  const { data: participants } = useQuery({
    queryKey: ['participants-public'],
    queryFn: async () => {
      const { data } = await supabase.from('participants').select('*, competitions(name)').order('created_at', { ascending: false })
      return data || []
    }
  })

  const mutation = useMutation({
    mutationFn: registerParticipant,
    onSuccess: () => {
      toast.success('Pendaftaran berhasil! Silakan tunggu konfirmasi panitia.')
      setFormData({ name: '', phone: '', age: '', gender: '', competition_id: formData.competition_id })
      queryClient.invalidateQueries({ queryKey: ['participants-public'] })
      queryClient.invalidateQueries({ queryKey: ['competitions-public'] })
    },
    onError: (error: any) => toast.error('Gagal mendaftar: ' + error.message)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.age || !formData.gender || !formData.competition_id) {
      toast.error('Mohon lengkapi semua data!')
      return
    }
    mutation.mutate({
      name: formData.name,
      phone: formData.phone,
      age: parseInt(formData.age),
      gender: formData.gender,
      competition_id: formData.competition_id
    })
  }

  // Group participants by competition
  const groupedParticipants = competitions?.map(c => {
    const list = participants?.filter(p => p.competition_id === c.id) || []
    return { ...c, list }
  }) || []

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBFB] font-sans">
      {/* Navbar */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between bg-white border-b border-red-50 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link className="text-lg font-bold text-red-700" to="/registration">Registration</Link>
                <Link className="text-lg font-semibold hover:text-red-700" to="/#transparansi">Transparency</Link>
                <Link className="text-lg font-semibold hover:text-red-700" to="/gallery">Gallery</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link className="flex items-center gap-2" to="/">
            <img src="/logo.png" alt="Logo Karang Taruna" className="h-12 w-12 object-contain rounded-full" />
          </Link>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link className="text-sm font-bold text-red-700 border-b-2 border-red-700 pb-1" to="/registration">Registration</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-red-700 transition-colors" to="/#transparansi">Transparency</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-red-700 transition-colors" to="/gallery">Gallery</Link>
        </nav>
        <Button className="bg-red-700 hover:bg-red-800 rounded-full px-4 md:px-6 font-semibold text-xs md:text-sm" asChild>
          <Link to="/login">Login</Link>
        </Button>
      </header>

      <main className="flex-1 py-12 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              Pendaftaran Lomba 17 Agustus
            </h1>
            <p className="text-lg text-muted-foreground">Rayakan Kemerdekaan dengan semangat kompetisi yang sportif.</p>
          </div>

          <Card className="border-none shadow-xl shadow-red-900/5 rounded-[2rem] overflow-hidden bg-white">
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Full Name</label>
                  <Input 
                    placeholder="Masukkan nama lengkap" 
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">WhatsApp Number</label>
                  <Input 
                    placeholder="0812xxxxxx" 
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Age</label>
                  <Input 
                    type="number"
                    placeholder="Umur" 
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Gender</label>
                  <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-zinc-900">Pilih Lomba</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {competitions?.map(c => {
                    const isSelected = formData.competition_id === c.id
                    const participantCount = c.participants?.length || 0
                    const isFull = c.quota > 0 && participantCount >= c.quota

                    return (
                      <button
                        type="button"
                        key={c.id}
                        disabled={isFull && !isSelected}
                        onClick={() => setFormData({...formData, competition_id: c.id})}
                        className={`text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                          isSelected ? 'border-red-600 bg-red-50' : isFull ? 'border-zinc-200 bg-zinc-100 opacity-60' : 'border-zinc-200 hover:border-red-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <p className={`font-bold ${isSelected ? 'text-red-900' : 'text-zinc-900'}`}>{c.name}</p>
                          <Trophy className={`w-5 h-5 ${isSelected ? 'text-red-600' : 'text-zinc-400'}`} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kuota</p>
                          <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isFull ? 'bg-zinc-500' : 'bg-red-600'}`} 
                              style={{ width: c.quota > 0 ? `${Math.min((participantCount / c.quota) * 100, 100)}%` : '100%' }}
                            />
                          </div>
                          <div className="flex justify-between text-xs font-bold mt-1">
                            {isFull ? (
                              <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px]">PENUH</span>
                            ) : (
                              <span className={isSelected ? 'text-red-700' : 'text-muted-foreground'}>Tersedia</span>
                            )}
                            <span>{c.quota > 0 ? `${participantCount}/${c.quota}` : `${participantCount} Terdaftar`}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={mutation.isPending || !formData.competition_id} 
                className="w-full bg-red-700 hover:bg-red-800 h-14 rounded-xl text-lg font-bold shadow-xl shadow-red-700/20"
              >
                {mutation.isPending ? 'Memproses...' : 'Daftar Sekarang 🚀'}
              </Button>
            </form>
          </Card>

          {/* Board Peserta */}
          <div className="space-y-6 pt-12 border-t">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900">
                <Users className="w-5 h-5 text-red-600" />
                Board Peserta
              </h2>
              <p className="text-sm font-semibold text-muted-foreground">Total: {participants?.length || 0} Pendaftar</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {groupedParticipants.map(group => (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl">
                    <h3 className="font-bold text-red-900">{group.name}</h3>
                    <Badge className="bg-red-700">{group.list.length}{group.quota > 0 ? `/${group.quota}` : ''}</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.list.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-4 italic">Belum ada peserta</p>
                    ) : (
                      group.list.map((p: any) => (
                        <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {p.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-zinc-900 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Warga RT/RW</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#FFFBFB] py-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 lg:px-12 text-sm text-muted-foreground font-medium">
          <p className="font-bold text-red-700">KarangTaruna Bina Pemuda</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-red-700">RT/RW Info</Link>
            <Link to="#" className="hover:text-red-700">Contact Us</Link>
          </div>
          <p className="mt-4 md:mt-0">© 2026 Panitia HUT RI</p>
        </div>
      </footer>
    </div>
  )
}
