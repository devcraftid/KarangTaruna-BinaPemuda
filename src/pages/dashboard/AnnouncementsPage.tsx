import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAnnouncements, deleteAnnouncement } from '@/features/announcements/api'
import { AnnouncementForm } from '@/features/announcements/AnnouncementForm'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AnnouncementsPage() {
  const { role } = useOutletContext<{ role: string }>()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Pengumuman berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus pengumuman: ' + error.message)
    }
  })

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus pengumuman ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const renderActionButtons = (item: any) => {
    if (role !== 'admin') return null
    return (
      <div className="flex gap-2 justify-end">
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditItem(item)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
          <p className="text-muted-foreground">Kelola informasi publik.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Daftar Pengumuman</CardTitle>
            <CardDescription>Pengumuman untuk warga terkait acara 17 Agustus.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Pengumuman
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Pengumuman Baru</DialogTitle>
                <DialogDescription>Sampaikan informasi penting kepada publik.</DialogDescription>
              </DialogHeader>
              <AnnouncementForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  {role === 'admin' && <TableHead className="text-right w-[100px]">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
                ) : !announcements || announcements.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-24">Belum ada data pengumuman.</TableCell></TableRow>
                ) : (
                  announcements.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.title}
                        <span className="block text-xs text-muted-foreground mt-1">{item.content}</span>
                      </TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      {role === 'admin' && <TableCell className="text-right">{renderActionButtons(item)}</TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengumuman</DialogTitle>
            <DialogDescription>Perbarui informasi pengumuman.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <AnnouncementForm 
              initialData={editItem} 
              onSuccess={() => setEditItem(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
