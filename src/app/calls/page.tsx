import { createClient } from '@/app/utils/supabase/server'
import CallsClient from './CallsClient'

export default async function CallsPage() {
  const supabase = await createClient()
  
  // Obtener llamadas
  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .order('phone_start_time', { ascending: false })

  // Obtener contactos con su fecha de creación
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id_contact, contact_created_date')

  // Crear un mapa de la fecha de creación por contacto
  const contactCreationDates = contacts?.reduce((acc, contact) => {
    if (contact.id_contact && contact.contact_created_date) {
      acc[contact.id_contact] = contact.contact_created_date
    }
    return acc
  }, {} as Record<string, string>) || {}

  return <CallsClient 
    initialCalls={calls || []} 
    contactCreationDates={contactCreationDates}
  />
} 