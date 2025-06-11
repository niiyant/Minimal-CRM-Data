'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pipeline } from '@/app/types/pipelines'
import PipelinesFilters from './PipelinesFilters'

interface PipelineMetrics {
  totalPipelines: number;
  pipelinesByStage: Record<string, number>;
  pipelinesByStatus: Record<string, number>;
  pipelinesByLocation: Record<string, number>;
}

interface LocationMetrics extends PipelineMetrics {
  location: string;
}

interface PipelinesClientProps {
  initialPipelines: Pipeline[];
  contactNames: Record<string, string>;
}

export default function PipelinesClient({ initialPipelines, contactNames }: PipelinesClientProps) {
  const [pipelines] = useState<Pipeline[]>(initialPipelines)
  const [filters, setFilters] = useState({
    location: '',
    stage: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  // Filtrar pipelines según los criterios
  const filteredPipelines = pipelines.filter(pipeline => {
    if (filters.location && pipeline.location_name !== filters.location) return false
    if (filters.stage && pipeline.pipeline_stage !== filters.stage) return false
    if (filters.status && pipeline.status !== filters.status) return false
    if (filters.startDate && pipeline.date_created && new Date(pipeline.date_created) < new Date(filters.startDate)) return false
    if (filters.endDate && pipeline.date_created && new Date(pipeline.date_created) > new Date(filters.endDate)) return false
    return true
  })

  // Obtener ubicaciones únicas
  const uniqueLocations = Array.from(
    new Set(pipelines.map(pipeline => pipeline.location_name).filter(Boolean))
  ).map(location_name => ({ location_name: location_name as string }))

  // Obtener etapas únicas
  const uniqueStages = Array.from(
    new Set(pipelines.map(pipeline => pipeline.pipeline_stage).filter(Boolean))
  ).filter((stage): stage is string => stage !== null)

  // Obtener estados únicos
  const uniqueStatuses = Array.from(
    new Set(pipelines.map(pipeline => pipeline.status).filter(Boolean))
  ).filter((status): status is string => status !== null)

  // Calcular métricas globales
  const metrics: PipelineMetrics = {
    totalPipelines: filteredPipelines.length,
    pipelinesByStage: {},
    pipelinesByStatus: {
      open: filteredPipelines.filter(p => p.status?.toLowerCase() === 'open').length,
      won: filteredPipelines.filter(p => p.status?.toLowerCase() === 'won').length
    },
    pipelinesByLocation: {}
  }

  // Calcular pipelines por etapa
  filteredPipelines.forEach(pipeline => {
    if (pipeline.pipeline_stage) {
      metrics.pipelinesByStage[pipeline.pipeline_stage] = (metrics.pipelinesByStage[pipeline.pipeline_stage] || 0) + 1
    }
  })

  // Calcular pipelines por ubicación
  filteredPipelines.forEach(pipeline => {
    if (pipeline.location_name) {
      metrics.pipelinesByLocation[pipeline.location_name] = (metrics.pipelinesByLocation[pipeline.location_name] || 0) + 1
    }
  })

  // Calcular métricas por ubicación
  const locationMetrics: LocationMetrics[] = filters.location 
    ? [uniqueLocations.find(loc => loc.location_name === filters.location)]
        .filter((loc): loc is { location_name: string } => loc !== undefined)
        .map(loc => {
          const locationPipelines = filteredPipelines.filter(pipeline => pipeline.location_name === loc.location_name)
          const locationMetrics: PipelineMetrics = {
            totalPipelines: locationPipelines.length,
            pipelinesByStage: {},
            pipelinesByStatus: {
              open: locationPipelines.filter(p => p.status?.toLowerCase() === 'open').length,
              won: locationPipelines.filter(p => p.status?.toLowerCase() === 'won').length
            },
            pipelinesByLocation: {}
          }

          locationPipelines.forEach(pipeline => {
            if (pipeline.pipeline_stage) {
              locationMetrics.pipelinesByStage[pipeline.pipeline_stage] = (locationMetrics.pipelinesByStage[pipeline.pipeline_stage] || 0) + 1
            }
            if (pipeline.location_name) {
              locationMetrics.pipelinesByLocation[pipeline.location_name] = (locationMetrics.pipelinesByLocation[pipeline.location_name] || 0) + 1
            }
          })

          return {
            ...locationMetrics,
            location: loc.location_name
          }
        })
    : uniqueLocations.map(location => {
        const locationPipelines = filteredPipelines.filter(pipeline => pipeline.location_name === location.location_name)
        const locationMetrics: PipelineMetrics = {
          totalPipelines: locationPipelines.length,
          pipelinesByStage: {},
          pipelinesByStatus: {
            open: locationPipelines.filter(p => p.status?.toLowerCase() === 'open').length,
            won: locationPipelines.filter(p => p.status?.toLowerCase() === 'won').length
          },
          pipelinesByLocation: {}
        }

        locationPipelines.forEach(pipeline => {
          if (pipeline.pipeline_stage) {
            locationMetrics.pipelinesByStage[pipeline.pipeline_stage] = (locationMetrics.pipelinesByStage[pipeline.pipeline_stage] || 0) + 1
          }
          if (pipeline.location_name) {
            locationMetrics.pipelinesByLocation[pipeline.location_name] = (locationMetrics.pipelinesByLocation[pipeline.location_name] || 0) + 1
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
        <h1 className="text-2xl font-bold text-gray-900">Resumen de Pipelines</h1>
        <Link 
          href="/pipelines/table" 
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
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Total de Pipelines</h2>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalPipelines}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Etapas Activas</h2>
            <p className="text-3xl font-bold text-blue-600">{Object.keys(metrics.pipelinesByStage).length}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Ubicaciones</h2>
            <p className="text-3xl font-bold text-blue-600">{Object.keys(metrics.pipelinesByLocation).length}</p>
          </div>
        </div>

        {/* Métricas por Estado */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Pipelines Abiertos</h2>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-blue-600">{metrics.pipelinesByStatus.open}</p>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {Math.round((metrics.pipelinesByStatus.open / metrics.totalPipelines) * 100)}%
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Pipelines Ganados</h2>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">{metrics.pipelinesByStatus.won}</p>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {Math.round((metrics.pipelinesByStatus.won / metrics.totalPipelines) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <PipelinesFilters 
        locations={uniqueLocations}
        stages={uniqueStages}
        statuses={uniqueStatuses}
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
                  Total Pipelines
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Etapas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Abiertos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ganados
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
                    {location.totalPipelines}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {Object.keys(location.pipelinesByStage).length}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.pipelinesByStatus.open}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.pipelinesByStatus.won}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipelines Recientes */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {filters.location ? `Pipelines Recientes de ${filters.location}` : 'Pipelines Recientes'}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pipeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Etapa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ubicación
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPipelines.slice(0, 5).map((pipeline) => (
                <tr key={pipeline.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {pipeline.id_contact ? contactNames[pipeline.id_contact] || '-' : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {pipeline.pipeline_name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {pipeline.pipeline_stage || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {pipeline.status || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {pipeline.location_name || '-'}
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