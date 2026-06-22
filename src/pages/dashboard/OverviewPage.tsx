
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  TrendingUp, TrendingDown, Wallet, FileText, Download, Target, 
  MessageCircle, Copy, Share2, FileSpreadsheet, Users
} from 'lucide-react'
import { toast } from 'sonner'

export default function OverviewPage() {
  const { data: finances } = useQuery({
    queryKey: ['finances-overview'],
    queryFn: async () => {
      const [{ data: incomes }, { data: expenses }] = await Promise.all([
        supabase.from('incomes').select('*').eq('status', 'approved'),
        supabase.from('expenses').select('*').eq('status', 'approved')
      ])
      return { incomes: incomes || [], expenses: expenses || [] }
    }
  })

  const totalIncome = finances?.incomes.reduce((sum, item) => sum + item.amount, 0) || 0
  const totalExpense = finances?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0
  const balance = totalIncome - totalExpense

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const reportText = `🇮🇩 LAPORAN AKHIR HUT RI KARANGTARUNA BINA PEMUDA 🇮🇩

Total Pemasukan: ${formatCurrency(totalIncome)}
Total Pengeluaran: ${formatCurrency(totalExpense)}
Sisa Saldo: ${formatCurrency(balance)}

Alhamdulillah, seluruh rangkaian acara berjalan lancar. Terima kasih atas partisipasi warga RT/RW tercinta.
Merdeka! ✊`

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText)
    toast.success('Laporan disalin ke clipboard')
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank')
  }

  return (
    <div className="flex flex-1 flex-col gap-8 max-w-[1000px] w-full pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-red-700">Laporan Akhir & Rekapitulasi</h1>
        <p className="text-muted-foreground font-medium text-[15px] leading-relaxed max-w-[800px]">
          Generate and manage comprehensive summaries for the 79th Indonesian Independence Day celebrations. Detailed financial tracking, participant analytics, and sponsorship fulfillment at your fingertips.
        </p>
      </div>

      {/* Ringkasan Keuangan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Income */}
        <Card className="border shadow-sm rounded-2xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Total Income</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{formatCurrency(totalIncome)}</h2>
            <p className="text-sm font-medium text-muted-foreground">+12% from target goal</p>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[80%]" />
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border shadow-sm rounded-2xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest">Total Expenses</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{formatCurrency(totalExpense)}</h2>
            <p className="text-sm font-medium text-muted-foreground">66% of budget utilized</p>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-600 w-[66%]" />
            </div>
          </CardContent>
        </Card>

        {/* Final Balance */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-[#3D2C2A] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Final Balance</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{formatCurrency(balance)}</h2>
            <p className="text-sm font-medium text-white/70">Surplus ready for RT cash</p>
            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[100%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Laporan Laporan Laporan */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Laporan Keuangan */}
        <Card className="border shadow-sm rounded-2xl flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Laporan Keuangan</h3>
            <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
              Historical transaction data including every single entry, donation, and purchase during the event cycle.
            </p>
            <div className="mt-auto space-y-3">
              <Button className="w-full bg-red-700 hover:bg-red-800 font-bold" onClick={() => toast.success('Mengunduh PDF...')}>
                <Download className="w-4 h-4 mr-2" /> Download PDF Report
              </Button>
              <Button variant="outline" className="w-full font-bold text-zinc-700" onClick={() => toast.success('Mengunduh Excel...')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export to Excel (.xlsx)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Laporan Lomba & Pemenang */}
        <Card className="border shadow-sm rounded-2xl flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Laporan Lomba & Pemenang</h3>
            <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
              List of all competition brackets, participant demographics, and official winner announcements with prize allocation.
            </p>
            <div className="mt-auto space-y-3">
              <Button className="w-full bg-red-700 hover:bg-red-800 font-bold" onClick={() => toast.success('Mengekspor daftar pemenang...')}>
                <Download className="w-4 h-4 mr-2" /> Export Winner List
              </Button>
              <Button variant="outline" className="w-full font-bold text-zinc-700" onClick={() => toast.success('Mengekspor data peserta...')}>
                <Users className="w-4 h-4 mr-2" /> Participant Database
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Laporan Sponsor */}
        <Card className="border shadow-sm rounded-2xl flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Laporan Sponsor</h3>
            <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
              Verification of sponsor logos placement, contribution summaries, and post-event acknowledgement letters.
            </p>
            <div className="mt-auto space-y-3">
              <Button className="w-full bg-red-700 hover:bg-red-800 font-bold" onClick={() => toast.success('Membuat laporan sponsor...')}>
                <FileText className="w-4 h-4 mr-2" /> Full Sponsor Report
              </Button>
              <Button variant="outline" className="w-full font-bold text-zinc-700" onClick={() => toast.success('Membuat template surat...')}>
                <FileText className="w-4 h-4 mr-2" /> Generate Thank You Letters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Section Row */}
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="border shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Quick Share Report</h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-4">
              Send a text-based summary to the warga WhatsApp group.
            </p>
            <div className="bg-red-50/50 rounded-xl p-4 mb-6 border border-red-100 font-mono text-sm text-zinc-800 whitespace-pre-wrap">
              {reportText}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="font-bold flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" /> Copy Text
              </Button>
              <Button className="font-bold flex-1 bg-[#25D366] hover:bg-[#20b858] text-white" onClick={handleWhatsApp}>
                <Share2 className="w-4 h-4 mr-2" /> Share to WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-[#3D2C2A] text-white overflow-hidden text-center flex flex-col items-center justify-center p-8 relative">
          <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto mb-6 shadow-xl relative z-10">
            {/* Generate real QR Code using QR Server API pointing to local landing page */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/')}&color=3D2C2A`} 
              alt="QR Code" 
              className="w-full h-full rounded-xl"
            />
          </div>
          <h3 className="font-bold text-lg mb-2 relative z-10">Transparency QR Code</h3>
          <p className="text-xs text-white/70 font-medium mb-6 relative z-10">
            Print this QR for the announcement board so residents can audit funds instantly.
          </p>
          <Button className="w-full bg-red-700 hover:bg-red-800 font-bold relative z-10">
            <Download className="w-4 h-4 mr-2" /> Download QR Image
          </Button>
          <p className="text-[9px] uppercase tracking-widest text-white/50 mt-4 relative z-10">PUBLIC LINK: KARANGTARUNA-BINAPEMUDA.ORG/REPORT</p>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </Card>
      </div>

    </div>
  )
}
