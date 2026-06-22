import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGalleryItem, uploadMedia } from './api'
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
  type: z.enum(['image', 'video']),
})

export function GalleryForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      type: 'image'
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!file) throw new Error('File belum dipilih')
      
      const url = await uploadMedia(file)
      return createGalleryItem({ ...values, url })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Media berhasil diunggah')
      form.reset()
      setFile(null)
      onSuccess()
    },
    onError: (error: any) => {
      toast.error('Gagal mengunggah media: ' + error.message)
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Media</FormLabel>
              <FormControl>
                <Input placeholder="Misal: Lomba Makan Kerupuk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">File Foto/Video</label>
          <Input 
            type="file" 
            accept="image/*,video/*"
            onChange={(e) => {
              const selected = e.target.files?.[0]
              if (selected) {
                setFile(selected)
                form.setValue('type', selected.type.startsWith('video') ? 'video' : 'image')
              }
            }} 
          />
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending || !file}>
            {mutation.isPending ? 'Mengunggah...' : 'Upload Media'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
