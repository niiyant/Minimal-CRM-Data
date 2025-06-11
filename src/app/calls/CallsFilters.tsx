'use client'

interface CallsFiltersProps {
  locations: { location_name: string }[]
  filters: {
    location: string
    startDate: string
    endDate: string
  }
  onFilterChange: (filters: {
    location: string
    startDate: string
    endDate: string
  }) => void
}

type FilterKey = 'location' | 'startDate' | 'endDate'

export default function CallsFilters({ locations, filters, onFilterChange }: CallsFiltersProps) {
  const handleFilterChange = (key: FilterKey, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Filtros</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <option value="">Todas las ubicaciones</option>
            {locations.map((location) => (
              <option key={location.location_name} value={location.location_name}>
                {location.location_name}
              </option>
            ))}
          </select>
        </div>

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