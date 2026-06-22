import { supabase } from '@/config/supabase'
import { logAudit } from '@/lib/audit'

export type GalleryRecord = {
  id: string
  title: string
  url: string
  type: 'image' | 'video'
  created_by: string
  created_at: string
}

export const getGallery = async () => {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data.map((item: any) => ({
    ...item,
    url: item.file_url || item.url
  })) as GalleryRecord[]
}

export const uploadMedia = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('gallery_media')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('gallery_media')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const createGalleryItem = async (record: Omit<GalleryRecord, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('galleries')
    .insert([
      { title: record.title, type: record.type, file_url: record.url, created_by: userData.user.id }
    ])
    .select()
    .single()
  
  if (error) throw error
  await logAudit('CREATE', 'gallery', data.id, data)
  return data
}

export const deleteGalleryItem = async (id: string) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data: oldData } = await supabase.from('galleries').select('*').eq('id', id).single()

  const { data: deletedData, error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', id)
    .select()
  
  if (error) throw error
  if (!deletedData || deletedData.length === 0) throw new Error('Data tidak dapat dihapus (mungkin diblokir oleh RLS Supabase)')
  await logAudit('DELETE', 'gallery', id, oldData || { id })
  return true
}
