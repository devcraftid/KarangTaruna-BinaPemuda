import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCompetition, updateCompetition } from './api'
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
  title: z.string().min(2, 'Judul lomba wajib diisi'),
  description: z.string().optional(),
  rules: z.string().optional(),
  schedule: z.string().min(1, 'Jadwal wajib diisi'),
  location: z.string().optional(),
  quota: z.coerce.number().min(0).optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming')
})

export function CompetitionForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      rules: initialData?.rules || '',
      schedule: initialData ? new Date(initialData.schedule).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      location: initialData?.location || '',
      quota: initialData?.quota || 0,
      status: initialData?.status || 'upcoming'
    },
  })

  const mutation = useMutation({
    mutationFn: (values: any) => initialData ? updateCompetition(initialData.id, values) : createCompetition(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success(initialData ? 'Data lomba berhasil diperbarui' : 'Data lomba berhasil ditambahkan')
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Lomba</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Balap Karung Dewasa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jadwal Lomba</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="quota"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kuota Peserta (0 = Tak Terbatas)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control as any}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Lapangan RT 01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
