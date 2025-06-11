'use client'

import { useState } from 'react'

interface Location {
  location_name: string
}

interface OpportunitiesFiltersProps {
  locations: Location[]
  stages: string[]
  types: string[]
  onFilterChange: (filters: {
    location: string
    stage: string
    type: string
    startDate: string
    endDate: string
  }) => void
}

export default function OpportunitiesFilters({
  locations,
  stages,
  types,
  onFilterChange
}: OpportunitiesFiltersProps) {
  const [filters, setFilters] = useState({
    location: '',
    stage: '',
    type: '',
    startDate: '',
    endDate: ''
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Filtros</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Filtros de Ubicación */}
        <div className="flex flex-col">
          <label htmlFor="location" className="mb-1 text-sm font-medium text-gray-700">
            Ubicación
          </label>
          <select
            id="location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {locations.map((location) => (
              <option key={location.location_name} value={location.location_name}>
                {location.location_name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros de Etapa */}
        <div className="flex flex-col">
          <label htmlFor="stage" className="mb-1 text-sm font-medium text-gray-700">
            Etapa
          </label>
          <select
            id="stage"
            value={filters.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros de Tipo */}
        <div className="flex flex-col">
          <label htmlFor="type" className="mb-1 text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros de Fecha */}
        <div className="flex flex-col">
          <label htmlFor="startDate" className="mb-1 text-sm font-medium text-gray-700">
            Fecha Inicio
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="endDate" className="mb-1 text-sm font-medium text-gray-700">
            Fecha Fin
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
} 