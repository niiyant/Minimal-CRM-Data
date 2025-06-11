import { createClient } from '@/app/utils/supabase/server'
import ContactsTable from '@/app/components/tables/ContactsTable'

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('full_name')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Lista de todos los contactos registrados en el sistema.
        </p>
      </div>
      <ContactsTable data={contacts || []} />
    </div>
  )
} 