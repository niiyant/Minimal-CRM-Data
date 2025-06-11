import { createClient } from '@/app/utils/supabase/server'
import OpportunitiesTable from '@/app/components/tables/OpportunitiesTable'

export default async function OpportunitiesTablePage() {
  const supabase = await createClient()
  
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Tabla de Oportunidades</h1>
      <OpportunitiesTable data={opportunities || []} />
    </div>
  )
} 