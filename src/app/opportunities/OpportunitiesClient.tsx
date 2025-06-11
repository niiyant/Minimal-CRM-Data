'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Opportunity } from '@/app/types/opportunities'
import OpportunitiesFilters from './OpportunitiesFilters'

interface OpportunityMetrics {
  totalOpportunities: number;
  opportunitiesByStage: Record<string, number>;
  opportunitiesByPipeline: Record<string, number>;
  opportunitiesByType: Record<string, number>;
  opportunitiesByLocation: Record<string, number>;
  opportunitiesByStatus: Record<string, number>;
}

interface LocationMetrics extends OpportunityMetrics {
  location: string;
}

interface OpportunitiesClientProps {
  initialOpportunities: Opportunity[];
  contactCreationDates: Record<string, string>;
}

export default function OpportunitiesClient({ initialOpportunities, contactCreationDates }: OpportunitiesClientProps) {
  const [opportunities] = useState<Opportunity[]>(initialOpportunities)
  const [filters, setFilters] = useState({
    location: '',
    stage: '',
    type: '',
    startDate: '',
    endDate: ''
  })

  // Filtrar oportunidades según los criterios
  const filteredOpportunities = opportunities.filter(opportunity => {
    if (filters.location && opportunity.location !== filters.location) return false
    if (filters.stage && opportunity.pipeline_stage !== filters.stage) return false
    if (filters.type && opportunity.tipo_campaña !== filters.type) return false
    if (filters.startDate && opportunity.date_created && new Date(opportunity.date_created) < new Date(filters.startDate)) return false
    if (filters.endDate && opportunity.date_created && new Date(opportunity.date_created) > new Date(filters.endDate)) return false
    return true
  })

  // Obtener ubicaciones únicas
  const uniqueLocations = Array.from(
    new Set(opportunities.map(opportunity => opportunity.location).filter(Boolean))
  ).map(location => ({ location_name: location as string }))

  // Obtener etapas únicas
  const uniqueStages = Array.from(
    new Set(opportunities.map(opportunity => opportunity.pipeline_stage).filter(Boolean))
  ).filter((stage): stage is string => stage !== null)

  // Obtener tipos únicos
  const uniqueTypes = Array.from(
    new Set(opportunities.map(opportunity => opportunity.tipo_campaña).filter(Boolean))
  ).filter((type): type is string => type !== null)

  // Obtener pipelines únicos
  const uniquePipelines = Array.from(
    new Set(opportunities.map(opportunity => opportunity.pipeline_name).filter(Boolean))
  ).filter((pipeline): pipeline is string => pipeline !== null)

  // Calcular métricas globales
  const metrics: OpportunityMetrics = {
    totalOpportunities: filteredOpportunities.length,
    opportunitiesByStage: {},
    opportunitiesByPipeline: {},
    opportunitiesByType: {},
    opportunitiesByLocation: {},
    opportunitiesByStatus: {
      open: filteredOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'open').length,
      abandoned: filteredOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'abandoned').length,
      won: filteredOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'won').length
    }
  }

  // Calcular oportunidades por etapa
  filteredOpportunities.forEach(opportunity => {
    if (opportunity.pipeline_stage) {
      metrics.opportunitiesByStage[opportunity.pipeline_stage] = (metrics.opportunitiesByStage[opportunity.pipeline_stage] || 0) + 1
    }
  })

  // Calcular oportunidades por pipeline
  filteredOpportunities.forEach(opportunity => {
    if (opportunity.pipeline_name) {
      metrics.opportunitiesByPipeline[opportunity.pipeline_name] = (metrics.opportunitiesByPipeline[opportunity.pipeline_name] || 0) + 1
    }
  })

  // Calcular oportunidades por tipo
  filteredOpportunities.forEach(opportunity => {
    if (opportunity.tipo_campaña) {
      metrics.opportunitiesByType[opportunity.tipo_campaña] = (metrics.opportunitiesByType[opportunity.tipo_campaña] || 0) + 1
    }
  })

  // Calcular oportunidades por ubicación
  filteredOpportunities.forEach(opportunity => {
    if (opportunity.location) {
      metrics.opportunitiesByLocation[opportunity.location] = (metrics.opportunitiesByLocation[opportunity.location] || 0) + 1
    }
  })

  // Calcular métricas por ubicación
  const locationMetrics: LocationMetrics[] = filters.location 
    ? [uniqueLocations.find(loc => loc.location_name === filters.location)]
        .filter((loc): loc is { location_name: string } => loc !== undefined)
        .map(loc => {
          const locationOpportunities = filteredOpportunities.filter(opportunity => opportunity.location === loc.location_name)
          const locationMetrics: OpportunityMetrics = {
            totalOpportunities: locationOpportunities.length,
            opportunitiesByStage: {},
            opportunitiesByPipeline: {},
            opportunitiesByType: {},
            opportunitiesByLocation: {},
            opportunitiesByStatus: {
              open: locationOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'open').length,
              abandoned: locationOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'abandoned').length,
              won: locationOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'won').length
            }
          }

          locationOpportunities.forEach(opportunity => {
            if (opportunity.pipeline_stage) {
              locationMetrics.opportunitiesByStage[opportunity.pipeline_stage] = (locationMetrics.opportunitiesByStage[opportunity.pipeline_stage] || 0) + 1
            }
            if (opportunity.pipeline_name) {
              locationMetrics.opportunitiesByPipeline[opportunity.pipeline_name] = (locationMetrics.opportunitiesByPipeline[opportunity.pipeline_name] || 0) + 1
            }
            if (opportunity.tipo_campaña) {
              locationMetrics.opportunitiesByType[opportunity.tipo_campaña] = (locationMetrics.opportunitiesByType[opportunity.tipo_campaña] || 0) + 1
            }
            if (opportunity.location) {
              locationMetrics.opportunitiesByLocation[opportunity.location] = (locationMetrics.opportunitiesByLocation[opportunity.location] || 0) + 1
            }
          })

          return {
            ...locationMetrics,
            location: loc.location_name
          }
        })
    : uniqueLocations.map(location => {
        const locationOpportunities = filteredOpportunities.filter(opportunity => opportunity.location === location.location_name)
        const locationMetrics: OpportunityMetrics = {
          totalOpportunities: locationOpportunities.length,
          opportunitiesByStage: {},
          opportunitiesByPipeline: {},
          opportunitiesByType: {},
          opportunitiesByLocation: {},
          opportunitiesByStatus: {
            open: locationOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'open').length,
            abandoned: locationOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'abandoned').length,
            won: locationOpportunities.filter(opp => opp.opportunity_st?.toLowerCase() === 'won').length
          }
        }

        locationOpportunities.forEach(opportunity => {
          if (opportunity.pipeline_stage) {
            locationMetrics.opportunitiesByStage[opportunity.pipeline_stage] = (locationMetrics.opportunitiesByStage[opportunity.pipeline_stage] || 0) + 1
          }
          if (opportunity.pipeline_name) {
            locationMetrics.opportunitiesByPipeline[opportunity.pipeline_name] = (locationMetrics.opportunitiesByPipeline[opportunity.pipeline_name] || 0) + 1
          }
          if (opportunity.tipo_campaña) {
            locationMetrics.opportunitiesByType[opportunity.tipo_campaña] = (locationMetrics.opportunitiesByType[opportunity.tipo_campaña] || 0) + 1
          }
          if (opportunity.location) {
            locationMetrics.opportunitiesByLocation[opportunity.location] = (locationMetrics.opportunitiesByLocation[opportunity.location] || 0) + 1
          }
        })

        return {
          ...locationMetrics,
          location: location.location_name
        }
      })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resumen de Oportunidades</h1>
        <Link 
          href="/opportunities/table" 
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Ver Tabla Completa
        </Link>
      </div>

      {/* Métricas Globales */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {filters.location ? `Métricas de ${filters.location}` : 'Métricas Globales'}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Total de Oportunidades</h2>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalOpportunities}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Pipelines Activos</h2>
            <p className="text-3xl font-bold text-blue-600">{Object.keys(metrics.opportunitiesByPipeline).length}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Tipos de Campaña</h2>
            <p className="text-3xl font-bold text-blue-600">{Object.keys(metrics.opportunitiesByType).length}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Ubicaciones</h2>
            <p className="text-3xl font-bold text-blue-600">{Object.keys(metrics.opportunitiesByLocation).length}</p>
          </div>
        </div>

        {/* Métricas por Estado */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Oportunidades Abiertas</h2>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-blue-600">{metrics.opportunitiesByStatus.open}</p>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {Math.round((metrics.opportunitiesByStatus.open / metrics.totalOpportunities) * 100)}%
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Oportunidades Abandonadas</h2>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-red-600">{metrics.opportunitiesByStatus.abandoned}</p>
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                {Math.round((metrics.opportunitiesByStatus.abandoned / metrics.totalOpportunities) * 100)}%
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Oportunidades Ganadas</h2>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">{metrics.opportunitiesByStatus.won}</p>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {Math.round((metrics.opportunitiesByStatus.won / metrics.totalOpportunities) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <OpportunitiesFilters 
        locations={uniqueLocations}
        stages={uniqueStages}
        types={uniqueTypes}
        sources={uniquePipelines}
        onFilterChange={setFilters}
      />

      {/* Métricas por Ubicación */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Métricas por Ubicación</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Oportunidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pipelines
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipos de Campaña
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {locationMetrics.map((location) => (
                <tr key={location.location} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {location.location}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.totalOpportunities}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {Object.keys(location.opportunitiesByPipeline).length}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {Object.keys(location.opportunitiesByType).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Oportunidades Recientes */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {filters.location ? `Oportunidades Recientes de ${filters.location}` : 'Oportunidades Recientes'}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Oportunidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pipeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Etapa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo Campaña
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ubicación
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredOpportunities.slice(0, 5).map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {opportunity.id_contact ? contactCreationDates[opportunity.id_contact] || '-' : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {opportunity.opportunity_name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {opportunity.pipeline_name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {opportunity.pipeline_stage || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {opportunity.tipo_campaña || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {opportunity.location || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 