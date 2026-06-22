import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompetitions } from './api'
import { getWinnerByCompetitionId, upsertWinner } from './winnersApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Trophy } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export function WinnersManagement() {
  const queryClient = useQueryClient()
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null)
  
  const { data: competitions, isLoading: compsLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: getCompetitions
  })

  const { data: winnerData } = useQuery({
    queryKey: ['winner', selectedCompId],
    queryFn: () => getWinnerByCompetitionId(selectedCompId!),
    enabled: !!selectedCompId
  })

  const [formData, setFormData] = useState({
    first_place: '',
    second_place: '',
    third_place: '',
    published: false
  })

  useEffect(() => {
    if (winnerData) {
      setFormData({
        first_place: winnerData.first_place || '',
        second_place: winnerData.second_place || '',
        third_place: winnerData.third_place || '',
        published: winnerData.published || false
      })
    } else {
      setFormData({ first_place: '', second_place: '', third_place: '', published: false })
    }
  }, [winnerData, selectedCompId])

  const mutation = useMutation({
    mutationFn: (values: any) => upsertWinner(values),
    onSuccess: () => {
      toast.success('Data pemenang berhasil disimpan')
      queryClient.invalidateQueries({ queryKey: ['winner', selectedCompId] })
    },
    onError: (err: any) => toast.error('Gagal menyimpan: ' + err.message)
  })

  const handleSave = () => {
    if (!selectedCompId) return
    mutation.mutate({
      id: winnerData?.id,
      competition_id: selectedCompId,
      ...formData
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Pilih Kompetisi</h3>
        <p className="text-sm text-muted-foreground">Kelola daftar pemenang untuk setiap kategori lomba.</p>
        
        {compsLoading ? <div className="p-4">Loading...</div> : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {competitions?.map((comp) => {
              const isSelected = selectedCompId === comp.id
              return (
                <Card 
                  key={comp.id} 
                  className={`min-w-[280px] cursor-pointer transition-all border-2 ${isSelected ? 'border-red-600 bg-red-50/50' : 'hover:border-red-200'}`}
                  onClick={() => setSelectedCompId(comp.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-red-600 text-white' : 'bg-zinc-100'}`}>
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{comp.title}</h4>
                      <p className="text-xs text-muted-foreground">Status: {comp.status}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {selectedCompId && (
        <Card className="border-none shadow-md">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">✏️</span>
              Input Data Pemenang: {competitions?.find(c => c.id === selectedCompId)?.title}
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { key: 'first_place', label: 'JUARA 1', color: 'bg-amber-400' },
                { key: 'second_place', label: 'JUARA 2', color: 'bg-zinc-300' },
                { key: 'third_place', label: 'JUARA 3', color: 'bg-orange-700 text-white' }
              ].map((place) => (
                <div key={place.key} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className={`${place.color} px-4 py-2 font-bold text-sm flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" /> {place.label}
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">Nama Pemenang / Tim</Label>
                      <Input 
                        placeholder="Masukkan nama" 
                        value={(formData as any)[place.key]}
                        onChange={(e) => setFormData({...formData, [place.key]: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Switch 
                  checked={formData.published} 
                  onCheckedChange={(v: boolean) => setFormData({...formData, published: v})}
                />
                <div>
                  <p className="font-bold text-sm">Publish ke Publik</p>
                  <p className="text-xs text-muted-foreground">Aktifkan untuk menampilkan di halaman utama warga.</p>
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={mutation.isPending}
                className="bg-red-700 hover:bg-red-800 px-8"
              >
                {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
