import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Video, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGallery, deleteGalleryItem } from '@/features/gallery/api'
import { GalleryForm } from '@/features/gallery/GalleryForm'
import { toast } from 'sonner'

export default function GalleryPage() {
  const { role } = useOutletContext<{ role: string }>()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: gallery, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: getGallery
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Media berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus media: ' + error.message)
    }
  })

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus media ini?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeri</h1>
          <p className="text-muted-foreground">Kelola foto dan video dokumentasi acara.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Dokumentasi Kegiatan</CardTitle>
            <CardDescription>Semua media akan tampil di halaman utama.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media Galeri</DialogTitle>
                <DialogDescription>Tambahkan foto atau video kegiatan terbaru.</DialogDescription>
              </DialogHeader>
              <GalleryForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            {isLoading ? (
              <div className="col-span-full text-center text-muted-foreground py-12">Loading...</div>
            ) : !gallery || gallery.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12 border rounded-lg border-dashed">
                Belum ada foto atau video.
              </div>
            ) : (
              gallery.map(item => (
                <div key={item.id} className="relative aspect-square rounded-lg border overflow-hidden group">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.title} className="object-cover w-full h-full" />
                  ) : (
                    <video src={item.url} controls className="object-cover w-full h-full" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center text-white gap-2">
                    <p className="text-sm font-medium line-clamp-3">{item.title}</p>
                    {role === 'admin' && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
