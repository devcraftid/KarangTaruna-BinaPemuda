import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Check, X, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSponsors, updateSponsorStatus, deleteSponsor } from '@/features/sponsors/api'
import { SponsorForm } from '@/features/sponsors/SponsorForm'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SponsorsPage() {
  const { role } = useOutletContext<{ role: string }>()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: getSponsors
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => updateSponsorStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
      toast.success('Status sponsor diperbarui')
    },
    onError: (error: any) => {
      toast.error('Gagal memperbarui status: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
      toast.success('Data sponsor berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus data: ' + error.message)
    }
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-500">Disetujui</Badge>
      case 'rejected': return <Badge variant="destructive">Ditolak</Badge>
      default: return <Badge variant="secondary">Pending</Badge>
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const renderActionButtons = (item: any) => {
    if (role !== 'admin') return null
    return (
      <div className="flex gap-2 justify-end">
        {item.status === 'pending' && (
          <>
            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600" onClick={() => statusMutation.mutate({ id: item.id, status: 'approved' })}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600" onClick={() => statusMutation.mutate({ id: item.id, status: 'rejected' })}>
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
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
          <h1 className="text-3xl font-bold tracking-tight">Sponsor</h1>
          <p className="text-muted-foreground">Kelola daftar sponsor acara 17 Agustus.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Daftar Sponsor</CardTitle>
            <CardDescription>Semua donatur dan sponsor kegiatan.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Data Sponsor</DialogTitle>
                <DialogDescription>Masukkan informasi donatur atau pihak sponsor.</DialogDescription>
              </DialogHeader>
              <SponsorForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Sponsor</TableHead>
                  <TableHead>PIC & Kontak</TableHead>
                  <TableHead>Nominal / Barang</TableHead>
                  <TableHead>Status</TableHead>
                  {role === 'admin' && <TableHead className="text-right w-[150px]">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow>
                ) : !sponsors || sponsors.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-24">Belum ada data sponsor.</TableCell></TableRow>
                ) : (
                  sponsors.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.contact_person || '-'}
                        {item.phone && <span className="block text-xs text-muted-foreground">{item.phone}</span>}
                      </TableCell>
                      <TableCell>{item.amount_or_goods}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
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
            <DialogTitle>Edit Data Sponsor</DialogTitle>
            <DialogDescription>Perbarui data donatur atau sponsor kegiatan.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <SponsorForm 
              initialData={editItem} 
              onSuccess={() => setEditItem(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
