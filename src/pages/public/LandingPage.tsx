import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Users, Wallet, Receipt, TrendingUp, Menu } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function LandingPage() {
  const { data: finances } = useQuery({
    queryKey: ['finances-combined'],
    queryFn: async () => {
      const [{ data: incomes }, { data: expenses }] = await Promise.all([
        supabase.from('incomes').select('*').eq('status', 'approved'),
        supabase.from('expenses').select('*').eq('status', 'approved')
      ])
      return { incomes: incomes || [], expenses: expenses || [] }
    }
  })

  const { data: competitions } = useQuery({
    queryKey: ['competitions-public'],
    queryFn: async () => {
      const { data } = await supabase.from('competitions').select('*, participants(id), winners(*)')
      return data || []
    }
  })

  const totalIncome = finances?.incomes.reduce((sum, item) => sum + item.amount, 0) || 0
  const totalExpense = finances?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0
  const balance = totalIncome - totalExpense

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const upcomingCompetitions = competitions?.filter(c => c.status === 'upcoming' || c.status === 'ongoing') || []
  const totalParticipants = competitions?.reduce((sum, c) => sum + (c.participants?.length || 0), 0) || 0

  // Combine and sort latest transactions
  const latestTransactions = [
    ...(finances?.incomes.map(i => ({ ...i, type: 'income', date: new Date(i.date) })) || []),
    ...(finances?.expenses.map(e => ({ ...e, type: 'expense', date: new Date(e.date) })) || [])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBFB] font-sans">
      {/* Navbar */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-red-50">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link className="text-lg font-semibold hover:text-red-700" to="/registration">Registration</Link>
                <Link className="text-lg font-semibold hover:text-red-700" to="#transparansi">Transparency</Link>
                <Link className="text-lg font-semibold hover:text-red-700" to="/gallery">Gallery</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link className="flex items-center gap-2" to="/">
            <img src="/logo.png" alt="Logo Karang Taruna" className="h-12 w-12 object-contain rounded-full" />
          </Link>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link className="text-sm font-semibold text-muted-foreground hover:text-red-700 transition-colors" to="/registration">Registration</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-red-700 transition-colors" to="#transparansi">Transparency</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-red-700 transition-colors" to="/gallery">Gallery</Link>
        </nav>
        <Button className="bg-red-700 hover:bg-red-800 rounded-full px-4 md:px-6 font-semibold text-xs md:text-sm" asChild>
          <Link to="/login">Login</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden w-full pt-16 pb-24 lg:pt-24 lg:pb-32 px-6 lg:px-12">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-red-50 to-transparent -z-10 rounded-br-[100px]" />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 font-semibold px-3 py-1 rounded-full">
                🇮🇩 HUT RI KE-79
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
                Rayakan Kemerdekaan <span className="text-red-700">ke-79</span> di Lingkungan Kita
              </h1>
              <p className="text-lg text-muted-foreground max-w-[500px] leading-relaxed">
                Platform manajemen modern untuk RT/RW mengelola lomba, donasi, dan transparansi kegiatan 17-an dengan lebih efisien.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-red-700 hover:bg-red-800 rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-red-700/20" asChild>
                  <Link to="/registration">Daftar Lomba</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-bold border-zinc-200 hover:bg-zinc-50" asChild>
                  <Link to="#transparansi">Lihat Transparansi</Link>
                </Button>
              </div>
              <p className="text-sm font-bold text-red-700 tracking-wide mt-8">KEMERDEKAAN TELAH TIBA! 🇮🇩</p>
            </div>

            <div className="relative mx-auto lg:ml-auto w-full max-w-[400px]">
              <div className="aspect-square rounded-[2.5rem] overflow-hidden relative flex items-center justify-center p-8 bg-white/50 border shadow-2xl">
                <img src="/waringin.png" alt="Waringin Mentality" className="object-contain w-full h-full drop-shadow-xl hover:scale-105 transition-transform duration-500" />
              </div>
              <Card className="absolute -bottom-6 -left-6 border-none shadow-xl rounded-2xl bg-white/90 backdrop-blur p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-extrabold text-xl leading-none">{totalParticipants}+</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Peserta Terdaftar</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Ringkasan Keuangan */}
        <section id="transparansi" className="w-full py-20 bg-white px-6 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Ringkasan Keuangan</h2>
              <p className="text-muted-foreground font-medium">Pembaruan transaksi secara real-time.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-none shadow-sm bg-zinc-50 rounded-3xl p-2 relative overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Total Pemasukan</p>
                  <p className="text-3xl font-bold text-zinc-900">{formatCurrency(totalIncome)}</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-zinc-50 rounded-3xl p-2 relative overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Total Pengeluaran</p>
                  <p className="text-3xl font-bold text-zinc-900">{formatCurrency(totalExpense)}</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-red-700 text-white rounded-3xl p-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Wallet className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white/80 mb-2">Sisa Saldo</p>
                  <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Daftar Lomba */}
        <section className="w-full py-20 bg-[#FCF8F8] px-6 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Daftar Lomba</h2>
                <p className="text-muted-foreground font-medium">Ikuti keseruan dan menangkan hadiah menarik.</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingCompetitions.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-12 bg-white rounded-3xl border border-dashed">Belum ada perlombaan yang dibuka.</div>
              ) : (
                upcomingCompetitions.map((lomba) => (
                  <Card key={lomba.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white flex flex-col group">
                    <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                      {/* Generative placeholder images for competitions based on index */}
                      <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${lomba.id}&backgroundColor=fca5a5,f87171,fecaca`} alt={lomba.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <Badge className="absolute top-4 left-4 bg-red-600/90 hover:bg-red-600 text-white border-none px-3">
                        {lomba.quota === 0 ? 'UMUM' : `${lomba.quota} KUOTA`}
                      </Badge>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-lg mb-3 line-clamp-1">{lomba.name}</h3>

                      {lomba.winners && lomba.winners[0]?.published && (
                        <div className="mb-4 bg-zinc-50 border rounded-xl p-3 space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Daftar Pemenang</p>
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className="text-yellow-500">🥇</span> {lomba.winners[0].first_place || '-'}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-zinc-400">🥈</span> {lomba.winners[0].second_place || '-'}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-orange-400">🥉</span> {lomba.winners[0].third_place || '-'}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto mb-6">
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <span className="text-red-500">🕐</span> {lomba.event_time ? lomba.event_time.slice(0, 5) : '00:00'} WIB
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <span className="text-red-500">👥</span> {lomba.participants?.length || 0} Terdaftar
                        </p>
                      </div>

                      {(!lomba.winners || !lomba.winners[0]?.published) && (
                        <Button className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl" asChild>
                          <Link to={`/registration?lomba=${lomba.id}`}>Daftar Sekarang</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Transparansi Table */}
        <section id="transparansi" className="w-full py-20 bg-white px-6 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Transparansi Dana</h2>
                <p className="text-muted-foreground font-medium">Seluruh aliran dana dapat dipantau oleh warga secara realtime.</p>
              </div>
              <Button variant="outline" className="rounded-full font-bold">
                Unduh Laporan PDF
              </Button>
            </div>

            <div className="border rounded-[2rem] overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-zinc-50/50 border-b">
                    <tr>
                      <th className="px-6 py-5 font-bold">Tanggal</th>
                      <th className="px-6 py-5 font-bold">Keterangan</th>
                      <th className="px-6 py-5 font-bold">Jenis</th>
                      <th className="px-6 py-5 font-bold">Jumlah</th>
                      <th className="px-6 py-5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {latestTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada transaksi.</td>
                      </tr>
                    ) : (
                      latestTransactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-5 font-medium">{format(trx.date, 'dd MMM yyyy', { locale: id })}</td>
                          <td className="px-6 py-5 font-bold text-zinc-900">
                            {trx.type === 'income' ? trx.source : trx.category}
                            {trx.description && <span className="block text-xs font-normal text-muted-foreground mt-1">{trx.description}</span>}
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="outline" className={trx.type === 'income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                              {trx.type === 'income' ? 'MASUK' : 'KELUAR'}
                            </Badge>
                          </td>
                          <td className={`px-6 py-5 font-bold ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {trx.type === 'income' ? '+' : '-'} {formatCurrency(trx.amount)}
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> VERIFIED
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-extrabold text-xl text-red-700 tracking-tight">KarangTaruna Bina Pemuda</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Platform digital terpercaya untuk pengelolaan hari kemerdekaan di tingkat komunitas terkecil.</p>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-muted-foreground">
            <Link to="#" className="hover:text-red-700 transition-colors">RT/RW Info</Link>
            <Link to="#" className="hover:text-red-700 transition-colors">Sponsorship</Link>
            <Link to="#" className="hover:text-red-700 transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-sm font-medium text-zinc-400">
            © 2026 Panitia HUT RI - KarangTaruna Bina Pemuda Platform
          </p>
        </div>
      </footer>
    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
