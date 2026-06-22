import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFinance, updateFinance } from './api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'


const formSchema = z.object({
  amount: z.coerce.number().min(1, 'Nominal harus lebih dari 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(2, 'Kategori wajib diisi'),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
})

type FinanceFormProps = {
  type: 'income' | 'expense'
  initialData?: any
  onSuccess: () => void
}

export function FinanceForm({ type, initialData, onSuccess }: FinanceFormProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: initialData?.amount || 0,
      type,
      category: initialData?.category || '',
      description: initialData?.description || '',
      date: initialData ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
      status: initialData?.status || 'pending'
    },
  })

  const mutation = useMutation({
    mutationFn: (values: any) => initialData ? updateFinance(initialData.id, values) : createFinance(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] })
      toast.success(initialData ? 'Data berhasil diperbarui' : (type === 'income' ? 'Pemasukan berhasil ditambahkan' : 'Pengeluaran berhasil ditambahkan'))
      form.reset()
      onSuccess()
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan data: ' + error.message)
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values as any)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control as any}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nominal (Rp)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori/Sumber</FormLabel>
              <FormControl>
                <Input placeholder={type === 'income' ? 'Misal: Donasi Warga' : 'Misal: Konsumsi'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan Tambahan</FormLabel>
              <FormControl>
                <Input placeholder="Opsional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Supabase RLS pending logic: Bendahara limits can be enforced in UI or backend. Here we default to pending */}
        
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
