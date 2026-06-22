import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompetitions, deleteCompetition } from '@/features/competitions/api'
import { CompetitionForm } from '@/features/competitions/CompetitionForm'
import { ParticipantsList } from '@/features/competitions/ParticipantsList'
import { WinnersManagement } from '@/features/competitions/WinnersManagement'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function CompetitionsPage() {
  const { role } = useOutletContext<{ role: string }>()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: getCompetitions
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Lomba berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus lomba: ' + error.message)
    }
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming': return <Badge variant="secondary">Akan Datang</Badge>
      case 'ongoing': return <Badge className="bg-blue-500">Berlangsung</Badge>
      case 'completed': return <Badge className="bg-green-500">Selesai</Badge>
      case 'cancelled': return <Badge variant="destructive">Batal</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus lomba ini? (Peserta yang mendaftar juga akan terhapus jika di-cascade database)')) {
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
          <h1 className="text-3xl font-bold tracking-tight">Lomba</h1>
          <p className="text-muted-foreground">Kelola daftar lomba dan peserta.</p>
        </div>
      </div>

      <Tabs defaultValue="competitions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="competitions">Daftar Lomba</TabsTrigger>
          <TabsTrigger value="participants">Pendaftar Online</TabsTrigger>
          <TabsTrigger value="winners">Manajemen Pemenang</TabsTrigger>
        </TabsList>
        
        <TabsContent value="competitions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Daftar Lomba</CardTitle>
                <CardDescription>Manajemen kegiatan perlombaan 17 Agustus.</CardDescription>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Lomba
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Data Lomba</DialogTitle>
                    <DialogDescription>Masukkan informasi kegiatan lomba baru.</DialogDescription>
                  </DialogHeader>
                  <CompetitionForm onSuccess={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Lomba</TableHead>
                      <TableHead>Jadwal & Lokasi</TableHead>
                      <TableHead>Kuota</TableHead>
                      <TableHead>Status</TableHead>
                      {role === 'admin' && <TableHead className="text-right w-[100px]">Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                    ) : !competitions || competitions.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">Belum ada data lomba.</TableCell></TableRow>
                    ) : (
                      competitions.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            {new Date(item.schedule).toLocaleString('id-ID')}
                            {item.location && <span className="block text-xs text-muted-foreground">{item.location}</span>}
                          </TableCell>
                          <TableCell>{item.quota === 0 || !item.quota ? 'Tak Terbatas' : item.quota}</TableCell>
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
        </TabsContent>
        
        <TabsContent value="participants" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Peserta</CardTitle>
              <CardDescription>Verifikasi peserta yang mendaftar secara online.</CardDescription>
            </CardHeader>
            <CardContent>
              <ParticipantsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winners" className="mt-4">
          <WinnersManagement />
        </TabsContent>
      </Tabs>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Lomba</DialogTitle>
            <DialogDescription>Perbarui informasi lomba.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <CompetitionForm 
              initialData={editItem} 
              onSuccess={() => setEditItem(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
