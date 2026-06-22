import { supabase } from '@/config/supabase'
import { logAudit } from '@/lib/audit'

export type WinnerRecord = {
  id: string
  competition_id: string
  first_place: string | null
  second_place: string | null
  third_place: string | null
  photo_url: string | null
  published: boolean
  created_at: string
}

export const getWinners = async () => {
  const { data, error } = await supabase
    .from('winners')
    .select('*, competitions(name)')
  
  if (error) throw error
  return data
}

export const getWinnerByCompetitionId = async (competitionId: string) => {
  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .eq('competition_id', competitionId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 means zero rows found
  return data
}

export const upsertWinner = async (record: Omit<WinnerRecord, 'id' | 'created_at'> & { id?: string }) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  if (record.id) {
    // Update
    const { data, error } = await supabase
      .from('winners')
      .update(record)
      .eq('id', record.id)
      .select()
      .single()
    
    if (error) throw error
    await logAudit('UPDATE', 'winners', data.id, data)
    return data
  } else {
    // Insert
    const { id, ...insertData } = record
    const { data, error } = await supabase
      .from('winners')
      .insert([insertData])
      .select()
      .single()
    
    if (error) throw error
    await logAudit('CREATE', 'winners', data.id, data)
    return data
  }
}
