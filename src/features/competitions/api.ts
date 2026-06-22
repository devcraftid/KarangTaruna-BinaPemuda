import { supabase } from '@/config/supabase'
import { logAudit } from '@/lib/audit'

export type CompetitionRecord = {
  id: string
  title: string
  description: string | null
  rules: string | null
  schedule: string
  location: string | null
  quota: number | null
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
}

export type ParticipantRecord = {
  id: string
  competition_id: string
  participant_number: string
  name: string
  age: number
  gender: string
  phone: string
  status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Dibatalkan'
  created_at: string
}

// === Competitions ===

export const getCompetitions = async () => {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .order('event_date', { ascending: true })
  
  if (error) throw error
  
  return data.map((item: any) => {
    let scheduleStr = ''
    if (item.event_date && item.event_time) {
      scheduleStr = `${item.event_date}T${item.event_time}`
    } else if (item.event_date) {
      scheduleStr = `${item.event_date}T00:00`
    }
    
    return {
      id: item.id,
      title: item.name,
      description: item.description,
      rules: item.prize, // mapped prize to rules for now
      schedule: scheduleStr,
      location: item.location,
      quota: item.quota,
      status: item.status,
      created_by: '',
      created_at: item.created_at
    }
  }) as CompetitionRecord[]
}

export const createCompetition = async (record: Omit<CompetitionRecord, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')
  const event_date = record.schedule ? record.schedule.split('T')[0] : null
  const event_time = record.schedule && record.schedule.includes('T') ? record.schedule.split('T')[1] : null

  const payload = { 
    name: record.title,
    description: record.description,
    quota: record.quota,
    event_date: event_date,
    event_time: event_time,
    location: record.location,
    prize: record.rules,
    status: record.status
  }

  const { data, error } = await supabase
    .from('competitions')
    .insert([
      payload
    ])
    .select()
    .single()
  
  if (error) throw error
  await logAudit('CREATE', 'competitions', data.id, data)
  return data
}

export const updateCompetition = async (id: string, record: Omit<CompetitionRecord, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const event_date = record.schedule ? record.schedule.split('T')[0] : null
  const event_time = record.schedule && record.schedule.includes('T') ? record.schedule.split('T')[1] : null

  const payload = { 
    name: record.title,
    description: record.description,
    quota: record.quota,
    event_date: event_date,
    event_time: event_time,
    location: record.location,
    prize: record.rules,
    status: record.status
  }

  const { data, error } = await supabase
    .from('competitions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  await logAudit('UPDATE', 'competitions', data.id, record)
  return data
}

export const deleteCompetition = async (id: string) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data: oldData } = await supabase.from('competitions').select('*').eq('id', id).single()

  const { data: deletedData, error } = await supabase
    .from('competitions')
    .delete()
    .eq('id', id)
    .select()
  
  if (error) throw error
  if (!deletedData || deletedData.length === 0) throw new Error('Data tidak dapat dihapus (mungkin diblokir oleh RLS Supabase)')
  await logAudit('DELETE', 'competitions', id, oldData || { id })
  return true
}

// === Participants ===

export const getParticipants = async () => {
  const { data, error } = await supabase
    .from('participants')
    .select('*, competitions(name)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const registerParticipant = async (record: Omit<ParticipantRecord, 'id' | 'created_at' | 'status' | 'participant_number'>) => {
  // Generate random 4 digit participant number for simple uniqueness
  const pNum = `P-${Math.floor(1000 + Math.random() * 9000)}`
  
  const { data, error } = await supabase
    .from('participants')
    .insert([
      { ...record, status: 'Menunggu Verifikasi', participant_number: pNum }
    ])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateParticipantStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('participants')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteParticipant = async (id: string) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data: oldData } = await supabase.from('participants').select('*').eq('id', id).single()

  const { data: deletedData, error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)
    .select()
  
  if (error) throw error
  if (!deletedData || deletedData.length === 0) throw new Error('Data tidak dapat dihapus (mungkin diblokir oleh RLS Supabase)')
  await logAudit('DELETE', 'participants', id, oldData || { id })
  return true
}
