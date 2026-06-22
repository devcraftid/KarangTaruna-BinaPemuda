import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/features/audit/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: getAuditLogs
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return <Badge className="bg-blue-500">CREATE</Badge>
      case 'UPDATE': return <Badge className="bg-orange-500">UPDATE</Badge>
      case 'UPDATE_STATUS': return <Badge className="bg-purple-500">STATUS</Badge>
      case 'DELETE': return <Badge variant="destructive">DELETE</Badge>
      default: return <Badge variant="secondary">{action}</Badge>
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Riwayat aktivitas sistem (Hanya Admin).</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jejak Aktivitas</CardTitle>
          <CardDescription>Semua perubahan data penting akan terekam di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Tabel</TableHead>
                  <TableHead>ID Record</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Detail Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                ) : !logs || logs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground h-24">Belum ada jejak aktivitas.</TableCell></TableRow>
                ) : (
                  logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[100px] truncate" title={log.record_id}>{log.record_id}</TableCell>
                      <TableCell>{log.profiles?.name || log.performed_by}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[100px]">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
