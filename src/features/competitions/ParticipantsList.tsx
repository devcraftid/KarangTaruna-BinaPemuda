import { useOutletContext } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getParticipants, updateParticipantStatus, deleteParticipant } from './api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react'

export function ParticipantsList() {
  const { role } = useOutletContext<{ role: string }>()
  const queryClient = useQueryClient()

  const { data: participants, isLoading } = useQuery({
    queryKey: ['participants'],
    queryFn: getParticipants
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateParticipantStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      toast.success('Status peserta diperbarui')
    },
    onError: (error: any) => {
      toast.error('Gagal update status: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      toast.success('Data peserta berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus data: ' + error.message)
    }
  })

  if (isLoading) return <div className="p-4 text-center">Loading participants...</div>

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus peserta ini?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead>No. Peserta</TableHead>
            <TableHead>Nama & Kontak</TableHead>
            <TableHead>Lomba</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[200px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!participants || participants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Belum ada peserta mendaftar.</TableCell>
            </TableRow>
          ) : (
            participants.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.participant_number}</TableCell>
                <TableCell>
                  <span className="font-semibold">{p.name} ({p.age} thn, {p.gender})</span>
                  <span className="block text-xs text-muted-foreground">{p.phone}</span>
                </TableCell>
                <TableCell>{p.competitions?.name}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 'Terverifikasi' ? 'default' : p.status === 'Dibatalkan' ? 'destructive' : 'secondary'}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {p.status === 'Menunggu Verifikasi' && role === 'admin' && (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => mutation.mutate({ id: p.id, status: 'Terverifikasi' })}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Terima
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => mutation.mutate({ id: p.id, status: 'Dibatalkan' })}>
                        <XCircle className="w-4 h-4 mr-1" /> Tolak
                      </Button>
                    </>
                  )}
                  {role === 'admin' && (
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
