import { supabase } from '@/config/supabase'

export type AuditLogRecord = {
  id: string
  action: string
  table_name: string
  record_id: string
  payload: any
  performed_by: string
  created_at: string
  profiles?: {
    name: string
  }
}

export const getAuditLogs = async () => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:performed_by (name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as AuditLogRecord[]
}
