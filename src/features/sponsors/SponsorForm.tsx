import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSponsor, updateSponsor } from './api'
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
  name: z.string().min(2, 'Nama sponsor wajib diisi'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  amount_or_goods: z.string().min(2, 'Nominal atau Barang wajib diisi'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
})

export function SponsorForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      contact_person: initialData?.contact_person || '',
      phone: initialData?.phone || '',
      amount_or_goods: initialData?.amount_or_goods || '',
      status: initialData?.status || 'pending'
    },
  })

  const mutation = useMutation({
    mutationFn: (values: any) => initialData ? updateSponsor(initialData.id, values) : createSponsor(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
      toast.success(initialData ? 'Data sponsor berhasil diperbarui' : 'Data sponsor berhasil ditambahkan')
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Instansi / Individu</FormLabel>
              <FormControl>
                <Input placeholder="Misal: PT Bina Pemuda Sejahtera" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="contact_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama PIC</FormLabel>
                <FormControl>
                  <Input placeholder="Nama kontak" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="08..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control as any}
          name="amount_or_goods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bentuk Sponsor</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Uang Tunai Rp 5.000.000 atau 10 Dus Air Mineral" {...field} />
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
