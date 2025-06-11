import { createClient } from '@/app/utils/supabase/server'
import LocationsTable from '@/app/components/tables/LocationsTable'

export default async function LocationsPage() {
  const supabase = await createClient()
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('location_name')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ubicaciones</h1>
        <p className="mt-2 text-sm text-gray-600">
          Lista de todas las ubicaciones registradas en el sistema.
        </p>
      </div>
      <LocationsTable data={locations || []} />
    </div>
  )
} 