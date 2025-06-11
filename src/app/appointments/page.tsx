import { createClient } from '@/app/utils/supabase/server'
import AppointmentsTable from '@/app/components/tables/AppointmentsTable'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .order('calendar_start_time', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Lista de todas las citas programadas en el sistema.
        </p>
      </div>
      <AppointmentsTable data={appointments || []} />
    </div>
  )
} 