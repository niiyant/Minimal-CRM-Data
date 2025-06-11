import { createClient } from '@/app/utils/supabase/server'
import OpportunitiesClient from './OpportunitiesClient'

export default async function OpportunitiesPage() {
  const supabase = await createClient()
  
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id_contact, contact_created_date')

  const contactCreationDates = contacts?.reduce((acc, contact) => {
    if (contact.id_contact && contact.contact_created_date) {
      acc[contact.id_contact] = contact.contact_created_date
    }
    return acc
  }, {} as Record<string, string>) || {}

  return (
    <OpportunitiesClient 
      initialOpportunities={opportunities || []} 
      contactCreationDates={contactCreationDates}
    />
  )
} 