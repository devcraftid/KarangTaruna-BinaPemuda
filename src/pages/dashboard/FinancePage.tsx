import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Check, X, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFinances, updateFinanceStatus, deleteFinance } from '@/features/finance/api'
import { FinanceForm } from '@/features/finance/FinanceForm'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function FinancePage() {
  const { role } = useOutletContext<{ role: string }>()
  const [openIncome, setOpenIncome] = useState(false)
  const [openExpense, setOpenExpense] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: finances, isLoading } = useQuery({
    queryKey: ['finances'],
    queryFn: getFinances
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status, type }: { id: string, status: 'approved' | 'rejected', type: 'income' | 'expense' }) => updateFinanceStatus(id, status, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] })
      toast.success('Status transaksi diperbarui')
    },
    onError: (error: any) => {
      toast.error('Gagal memperbarui status: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string, type: 'income' | 'expense' }) => deleteFinance(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] })
      toast.success('Data berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus data: ' + error.message)
    }
  })

  const incomes = finances?.filter(f => f.type === 'income') || []
  const expenses = finances?.filter(f => f.type === 'expense') || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-500">Disetujui</Badge>
      case 'rejected': return <Badge variant="destructive">Ditolak</Badge>
      default: return <Badge variant="secondary">Pending</Badge>
    }
  }

  const handleDelete = (id: string, type: 'income' | 'expense') => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      deleteMutation.mutate({ id, type })
    }
  }

  const renderActionButtons = (item: any) => {
    if (role !== 'admin') return null
    return (
      <div className="flex gap-2 justify-end">
        {item.status === 'pending' && (
          <>
            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600" onClick={() => statusMutation.mutate({ id: item.id, status: 'approved', type: item.type })}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600" onClick={() => statusMutation.mutate({ id: item.id, status: 'rejected', type: item.type })}>
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditItem(item)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id, item.type)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
          <p className="text-muted-foreground">Kelola pemasukan dan pengeluaran acara 17 Agustus.</p>
        </div>
      </div>

      <Tabs defaultValue="incomes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="incomes">Pemasukan</TabsTrigger>
          <TabsTrigger value="expenses">Pengeluaran</TabsTrigger>
        </TabsList>
        <TabsContent value="incomes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Daftar Pemasukan</CardTitle>
                <CardDescription>Semua dana yang masuk ke kas panitia.</CardDescription>
              </div>
              <Dialog open={openIncome} onOpenChange={setOpenIncome}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pemasukan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Data Pemasukan</DialogTitle>
                    <DialogDescription>Masukkan detail dana yang masuk ke kas panitia.</DialogDescription>
                  </DialogHeader>
                  <FinanceForm type="income" onSuccess={() => setOpenIncome(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead className="text-right w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                    ) : incomes.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">Belum ada data pemasukan.</TableCell></TableRow>
                    ) : (
                      incomes.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">+{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-right">{renderActionButtons(item)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Daftar Pengeluaran</CardTitle>
                <CardDescription>Semua dana yang dikeluarkan dari kas panitia.</CardDescription>
              </div>
              <Dialog open={openExpense} onOpenChange={setOpenExpense}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pengeluaran
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Data Pengeluaran</DialogTitle>
                    <DialogDescription>Masukkan detail pengeluaran untuk keperluan acara.</DialogDescription>
                  </DialogHeader>
                  <FinanceForm type="expense" onSuccess={() => setOpenExpense(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead className="text-right w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                    ) : expenses.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">Belum ada data pengeluaran.</TableCell></TableRow>
                    ) : (
                      expenses.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">-{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-right">{renderActionButtons(item)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Keuangan</DialogTitle>
            <DialogDescription>Perbarui data keuangan acara.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <FinanceForm 
              type={editItem.type} 
              initialData={editItem} 
              onSuccess={() => setEditItem(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
