import { createClient } from '@/app/utils/supabase/server'
import PipelinesClient from './PipelinesClient'

export default async function PipelinesPage() {
  const supabase = await createClient()
  
  // Obtener pipelines
  const { data: pipelines } = await supabase
    .from('pipelines')
    .select('*')
    .order('created_at', { ascending: false })

  // Obtener contactos
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id_contact, full_name')

  // Crear un mapa de nombres por contacto
  const contactNames = contacts?.reduce((acc, contact) => {
    if (contact.id_contact && contact.full_name) {
      acc[contact.id_contact] = contact.full_name
    }
    return acc
  }, {} as Record<string, string>) || {}

  return <PipelinesClient 
    initialPipelines={pipelines || []} 
    contactNames={contactNames}
  />
} 