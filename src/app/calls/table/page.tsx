import { createClient } from '@/app/utils/supabase/server'
import CallsTable from '@/app/components/tables/CallsTable'

export default async function CallsTablePage() {
  const supabase = await createClient()

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Tabla de Llamadas</h1>
      <CallsTable data={calls || []} />
    </div>
  )
} 