import { supabase } from '@/config/supabase'
import { logAudit } from '@/lib/audit'

export type FinanceRecord = {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string | null
  date: string
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  approved_by: string | null
  created_at: string
}

export const getFinances = async () => {
  const { data: incomes, error: err1 } = await supabase.from('incomes').select('*')
  if (err1) throw err1

  const { data: expenses, error: err2 } = await supabase.from('expenses').select('*')
  if (err2) throw err2

  const unified: FinanceRecord[] = [
    ...(incomes || []).map(i => ({
      id: i.id,
      date: i.date,
      amount: i.amount,
      type: 'income' as const,
      category: i.source, // Map source to category
      description: i.description,
      status: i.status,
      created_by: i.created_by,
      approved_by: null, // incomes doesn't have approved_by yet, or we can just ignore it
      created_at: i.created_at
    })),
    ...(expenses || []).map(e => ({
      id: e.id,
      date: e.date,
      amount: e.amount,
      type: 'expense' as const,
      category: e.category,
      description: e.description,
      status: e.status,
      created_by: e.created_by,
      approved_by: null,
      created_at: e.created_at
    }))
  ]
  return unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const createFinance = async (record: Omit<FinanceRecord, 'id' | 'created_at' | 'created_by' | 'approved_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const table = record.type === 'income' ? 'incomes' : 'expenses'
  
  let payload: any = {
    date: record.date,
    amount: record.amount,
    description: record.description,
    status: record.status,
    created_by: userData.user.id
  }

  if (record.type === 'income') {
    payload.source = record.category
  } else {
    payload.category = record.category
  }

  const { data, error } = await supabase.from(table).insert([payload]).select().single()
  
  if (error) throw error

  await logAudit('CREATE', table, data.id, payload)

  return data
}

export const updateFinanceStatus = async (id: string, status: 'approved' | 'rejected', type: 'income' | 'expense') => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const table = type === 'income' ? 'incomes' : 'expenses'

  const { data, error } = await supabase
    .from(table)
    .update({ status }) // Removed approved_by since it's not in schema.sql
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await logAudit('UPDATE_STATUS', table, data.id, { status })

  return data
}

export const updateFinance = async (id: string, record: Omit<FinanceRecord, 'id' | 'created_at' | 'created_by' | 'approved_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const table = record.type === 'income' ? 'incomes' : 'expenses'
  
  let payload: any = {
    date: record.date,
    amount: record.amount,
    description: record.description,
    status: record.status
  }

  if (record.type === 'income') {
    payload.source = record.category
  } else {
    payload.category = record.category
  }

  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  await logAudit('UPDATE', table, data.id, payload)

  return data
}

export const deleteFinance = async (id: string, type: 'income' | 'expense') => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const table = type === 'income' ? 'incomes' : 'expenses'

  // Fetch before delete for audit log
  const { data: oldData } = await supabase.from(table).select('*').eq('id', id).single()

  const { data: deletedData, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select()
  
  if (error) throw error
  if (!deletedData || deletedData.length === 0) throw new Error('Data tidak dapat dihapus (mungkin diblokir oleh RLS Supabase)')

  await logAudit('DELETE', table, id, oldData || { id })

  return true
}
