import { supabase } from '@/config/supabase'
import { logAudit } from '@/lib/audit'

export type AnnouncementRecord = {
  id: string
  title: string
  content: string
  status: 'draft' | 'published' | 'archived'
  created_by: string
  created_at: string
}

export const getAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as AnnouncementRecord[]
}

export const createAnnouncement = async (record: Omit<AnnouncementRecord, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('announcements')
    .insert([
      { ...record, created_by: userData.user.id }
    ])
    .select()
    .single()
  
  if (error) throw error
  await logAudit('CREATE', 'announcements', data.id, data)
  return data
}

export const updateAnnouncement = async (id: string, record: Omit<AnnouncementRecord, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('announcements')
    .update(record)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  await logAudit('UPDATE', 'announcements', data.id, record)
  return data
}

export const deleteAnnouncement = async (id: string) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data: oldData } = await supabase.from('announcements').select('*').eq('id', id).single()

  const { data: deletedData, error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)
    .select()
  
  if (error) throw error
  if (!deletedData || deletedData.length === 0) throw new Error('Data tidak dapat dihapus (mungkin diblokir oleh RLS Supabase)')
  await logAudit('DELETE', 'announcements', id, oldData || { id })
  return true
}
