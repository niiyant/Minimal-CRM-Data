import { createClient } from '@/app/utils/supabase/server'
import PipelinesTable from '@/app/components/tables/PipelinesTable'

export default async function PipelinesTablePage() {
  const supabase = await createClient()
  
  const { data: pipelines } = await supabase
    .from('pipelines')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Tabla de Pipelines</h1>
      <PipelinesTable data={pipelines || []} />
    </div>
  )
} 