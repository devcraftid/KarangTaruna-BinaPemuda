import { supabase } from '@/config/supabase'
import { logAudit } from '@/lib/audit'

export type SponsorRecord = {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  amount_or_goods: string
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  created_at: string
}

const mapStatusToDb = (status: string) => {
  switch(status) {
    case 'approved': return 'Sudah Memberi Sponsor'
    case 'rejected': return 'Belum Dikunjungi'
    default: return 'Menunggu Konfirmasi'
  }
}

const mapStatusToFrontend = (status: string) => {
  switch(status) {
    case 'Sudah Memberi Sponsor': return 'approved'
    case 'Belum Dikunjungi': return 'rejected'
    default: return 'pending'
  }
}

export const getSponsors = async () => {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    contact_person: item.pic_name,
    phone: item.phone,
    amount_or_goods: item.amount ? `Rp ${item.amount}` : (item.notes || '-'),
    status: mapStatusToFrontend(item.status),
    created_by: item.created_by,
    created_at: item.created_at
  })) as SponsorRecord[]
}

export const createSponsor = async (record: Omit<SponsorRecord, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  let amount: number | null = null;
  let notes: string | null = null;

  // Simple parsing to detect if it's a number
  const parsedAmount = parseInt(record.amount_or_goods.replace(/[^0-9]/g, ''))
  if (!isNaN(parsedAmount) && parsedAmount > 0 && !record.amount_or_goods.toLowerCase().includes('dus') && !record.amount_or_goods.toLowerCase().includes('barang')) {
    amount = parsedAmount
  } else {
    notes = record.amount_or_goods
  }

  const { data, error } = await supabase
    .from('sponsors')
    .insert([
      { 
        name: record.name,
        pic_name: record.contact_person,
        phone: record.phone,
        amount: amount,
        notes: notes,
        status: mapStatusToDb(record.status),
        created_by: userData.user.id
      }
    ])
    .select()
    .single()
  
  if (error) throw error
  
  await logAudit('CREATE', 'sponsors', data.id, data)
  return data
}

export const updateSponsorStatus = async (id: string, status: 'approved' | 'rejected') => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const dbStatus = mapStatusToDb(status)

  const { data, error } = await supabase
    .from('sponsors')
    .update({ status: dbStatus })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await logAudit('UPDATE_STATUS', 'sponsors', data.id, { status: dbStatus })

  return data
}

export const updateSponsor = async (id: string, record: Omit<SponsorRecord, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  let amount: number | null = null;
  let notes: string | null = null;

  const parsedAmount = parseInt(record.amount_or_goods.replace(/[^0-9]/g, ''))
  if (!isNaN(parsedAmount) && parsedAmount > 0 && !record.amount_or_goods.toLowerCase().includes('dus') && !record.amount_or_goods.toLowerCase().includes('barang')) {
    amount = parsedAmount
  } else {
    notes = record.amount_or_goods
  }

  const payload = { 
    name: record.name,
    pic_name: record.contact_person,
    phone: record.phone,
    amount: amount,
    notes: notes,
    status: mapStatusToDb(record.status)
  }

  const { data, error } = await supabase
    .from('sponsors')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await logAudit('UPDATE', 'sponsors', data.id, payload)

  return data
}

export const deleteSponsor = async (id: string) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data: oldData } = await supabase.from('sponsors').select('*').eq('id', id).single()

  const { data: deletedData, error } = await supabase
    .from('sponsors')
    .delete()
    .eq('id', id)
    .select()
  
  if (error) throw error
  if (!deletedData || deletedData.length === 0) throw new Error('Data tidak dapat dihapus (mungkin diblokir oleh RLS Supabase)')

  await logAudit('DELETE', 'sponsors', id, oldData || { id })

  return true
}
