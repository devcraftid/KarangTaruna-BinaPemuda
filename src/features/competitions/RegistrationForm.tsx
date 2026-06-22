import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { registerParticipant } from './api'
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
  name: z.string().min(2, 'Nama lengkap wajib diisi'),
  age: z.coerce.number().min(1, 'Umur tidak valid'),
  gender: z.enum(['Laki-laki', 'Perempuan']),
  phone: z.string().min(10, 'Nomor HP tidak valid'),
})

export function RegistrationForm({ competitionId, onSuccess }: { competitionId: string, onSuccess: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      age: 0,
      gender: 'Laki-laki',
      phone: ''
    },
  })

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return registerParticipant({ ...values, competition_id: competitionId })
    },
    onSuccess: () => {
      toast.success('Pendaftaran berhasil! Silakan tunggu verifikasi panitia.')
      form.reset()
      onSuccess()
    },
    onError: (error: any) => {
      toast.error('Gagal mendaftar: ' + error.message)
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control as any}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Budi Santoso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Umur</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                {/* Fallback to Input for now if Select is uninstalled */}
                <FormControl>
                  <select 
                    {...field}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control as any}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor WhatsApp</FormLabel>
              <FormControl>
                <Input placeholder="Misal: 08123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Mendaftar...' : 'Kirim Pendaftaran'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
