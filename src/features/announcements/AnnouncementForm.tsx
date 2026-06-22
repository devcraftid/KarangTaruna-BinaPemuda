import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnnouncement, updateAnnouncement } from './api'
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
  title: z.string().min(2, 'Judul wajib diisi'),
  content: z.string().min(5, 'Isi pengumuman wajib diisi'),
  status: z.enum(['draft', 'published', 'archived']).default('published')
})

export function AnnouncementForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      status: initialData?.status || 'published'
    },
  })

  const mutation = useMutation({
    mutationFn: (values: any) => initialData ? updateAnnouncement(initialData.id, values) : createAnnouncement(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success(initialData ? 'Pengumuman berhasil diperbarui' : 'Pengumuman berhasil dibuat')
      form.reset()
      onSuccess()
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan pengumuman: ' + error.message)
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
              <FormLabel>Judul Pengumuman</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Kerja Bakti Persiapan Lomba" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Isi Pengumuman</FormLabel>
              <FormControl>
                {/* We use Input here, ideally Textarea but we haven't installed Textarea component */}
                <Input placeholder="Tuliskan isi pengumuman..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Terbitkan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
