import { supabase } from '@/config/supabase'

export const logAudit = async (action: string, table_name: string, record_id: string | null = null, details: any = null) => {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return // Don't log if not authenticated

    await supabase.from('audit_logs').insert([
      {
        user_id: userData.user.id,
        action,
        table_name,
        record_id,
        details
      }
    ])
  } catch (error) {
    console.error('Audit log failed:', error)
  }
}
