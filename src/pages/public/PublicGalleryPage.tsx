import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Search, UploadCloud, Image as ImageIcon, Video, Calendar, Menu } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function PublicGalleryPage() {
  const [filter, setFilter] = useState('Semua')
  const [search, setSearch] = useState('')

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['galleries-public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('galleries').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error("Error fetching galleries:", error)
        return []
      }
      return data || []
    }
  })

  const filteredData = galleries?.filter(item => {
    if (filter === 'Foto' && item.type !== 'image') return false
    if (filter === 'Video' && item.type !== 'video') return false
    // If title has tags like Lomba, Malam Puncak, Persiapan
    if (filter !== 'Semua' && filter !== 'Foto' && filter !== 'Video') {
      if (!item.title?.toLowerCase().includes(filter.toLowerCase())) return false
    }
    if (search && !item.title?.toLowerCase().includes(search.toLowerCase())) return false
    return true
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
                <Link className="text-lg font-semibold hover:text-red-700" to="/registration">Registration</Link>
                <Link className="text-lg font-semibold hover:text-red-700" to="/#transparansi">Transparency</Link>
                <Link className="text-lg font-bold text-red-700" to="/gallery">Gallery</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link className="flex items-center gap-2" to="/">
            <img src="/logo.png" alt="Logo Karang Taruna" className="h-12 w-12 object-contain rounded-full" />
          </Link>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link className="text-sm font-semibold text-muted-foreground hover:text-red-700 transition-colors" to="/registration">Registration</Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-red-700 transition-colors" to="/#transparansi">Transparency</Link>
          <Link className="text-sm font-bold text-red-700 border-b-2 border-red-700 pb-1" to="/gallery">Gallery</Link>
        </nav>
        <Button className="bg-red-700 hover:bg-red-800 rounded-full px-4 md:px-6 font-semibold text-xs md:text-sm" asChild>
          <Link to="/login">Login</Link>
        </Button>
      </header>

      <main className="flex-1 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="space-y-4 max-w-2xl">
            <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Dokumentasi Digital</div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              Galeri Kemerdekaan
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Menelusuri jejak semangat persatuan melalui lensa warga. Kumpulan momen terbaik perayaan HUT RI di lingkungan RT/RW kita, mulai dari persiapan yang penuh dedikasi hingga malam puncak yang meriah.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between py-6 border-y">
            <div className="flex flex-wrap gap-2">
              {['Semua', 'Foto', 'Video', 'Lomba', 'Malam Puncak', 'Persiapan'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    filter === f 
                    ? 'bg-red-700 text-white shadow-md shadow-red-700/20' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  placeholder="Cari momen..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-white border-zinc-200 rounded-full h-10"
                />
              </div>
              <Button variant="outline" className="rounded-full font-bold border-zinc-200 bg-zinc-800 text-white hover:bg-zinc-700 h-10">
                <UploadCloud className="w-4 h-4 mr-2" /> Upload Media
              </Button>
            </div>
          </div>

          {/* Masonry / Grid Gallery */}
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground font-medium">Memuat galeri...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed">
              <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-zinc-900">Belum ada momen</h3>
              <p className="text-muted-foreground">Jadilah yang pertama mengunggah dokumentasi acara!</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredData.map((item) => (
                <Card key={item.id} className="break-inside-avoid border-none shadow-md hover:shadow-xl transition-all rounded-[1.5rem] overflow-hidden bg-white group cursor-pointer">
                  <div className="relative">
                    {item.type === 'image' ? (
                      <img src={item.file_url} alt={item.title} className="w-full object-cover" />
                    ) : (
                      <div className="relative">
                        <video src={item.file_url} className="w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                          <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg">
                            <Video className="w-5 h-5 ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Tags overlay */}
                    {item.title?.includes('Lomba') && (
                      <Badge className="absolute top-4 left-4 bg-red-600 border-none px-2 py-0.5 rounded uppercase font-bold text-[10px] tracking-widest">
                        Lomba
                      </Badge>
                    )}
                    {item.title?.includes('Malam Puncak') && (
                      <Badge className="absolute top-4 left-4 bg-blue-600 border-none px-2 py-0.5 rounded uppercase font-bold text-[10px] tracking-widest">
                        Malam Puncak
                      </Badge>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-2 group-hover:text-red-700 transition-colors">{item.title}</h3>
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(item.created_at), 'dd MMM yyyy', { locale: id })}
                      </div>
                      {item.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
