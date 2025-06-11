'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { Appointment } from '@/app/types/appointments'

interface AppointmentsTableProps {
  data: Appointment[]
}

const AppointmentsTable = ({ data = [] }: AppointmentsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    full_name: '',
    location: '',
    calendar_title: '',
    calendar_status: '',
    current_stage: '',
    tipo_campaña: ''
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const uniqueLocations = useMemo(() => 
    Array.from(new Set(data.map(app => app.location).filter(Boolean))),
    [data]
  )

  const uniqueStatuses = useMemo(() => 
    Array.from(new Set(data.map(app => app.calendar_status).filter(Boolean))),
    [data]
  )

  const uniqueStages = useMemo(() => 
    Array.from(new Set(data.map(app => app.current_stage).filter(Boolean))),
    [data]
  )

  const uniqueTypes = useMemo(() => 
    Array.from(new Set(data.map(app => app.tipo_campaña).filter(Boolean))),
    [data]
  )

  const filteredData = useMemo(() => 
    data.filter(appointment => {
      if (filters.full_name && !appointment.full_name?.toLowerCase().includes(filters.full_name.toLowerCase())) return false
      if (filters.location && appointment.location !== filters.location) return false
      if (filters.calendar_title && !appointment.calendar_title?.toLowerCase().includes(filters.calendar_title.toLowerCase())) return false
      if (filters.calendar_status && appointment.calendar_status !== filters.calendar_status) return false
      if (filters.current_stage && appointment.current_stage !== filters.current_stage) return false
      if (filters.tipo_campaña && appointment.tipo_campaña !== filters.tipo_campaña) return false
      return true
    }),
    [data, filters]
  )

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nombre',
    },
    {
      accessorKey: 'location',
      header: 'Ubicación',
    },
    {
      accessorKey: 'calendar_title',
      header: 'Título',
    },
    {
      accessorKey: 'calendar_start_time',
      header: 'Fecha Inicio',
      cell: ({ row }) => {
        const date = row.original.calendar_start_time
        return date ? new Date(date).toLocaleString('es-ES') : '-'
      },
    },
    {
      accessorKey: 'calendar_end_time',
      header: 'Fecha Fin',
      cell: ({ row }) => {
        const date = row.original.calendar_end_time
        return date ? new Date(date).toLocaleString('es-ES') : '-'
      },
    },
    {
      accessorKey: 'calendar_status',
      header: 'Estado',
    },
    {
      accessorKey: 'current_stage',
      header: 'Etapa',
    },
    {
      accessorKey: 'tipo_campaña',
      header: 'Tipo Campaña',
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div className="w-full">
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Filtros</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={filters.full_name}
              onChange={(e) => handleFilterChange('full_name', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Buscar por nombre"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Ubicación
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las ubicaciones</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={filters.calendar_title}
              onChange={(e) => handleFilterChange('calendar_title', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Buscar por título"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={filters.calendar_status}
              onChange={(e) => handleFilterChange('calendar_status', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Etapa
            </label>
            <select
              value={filters.current_stage}
              onChange={(e) => handleFilterChange('current_stage', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las etapas</option>
              {uniqueStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Tipo Campaña
            </label>
            <select
              value={filters.tipo_campaña}
              onChange={(e) => handleFilterChange('tipo_campaña', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header.column.columnDef.header as string}</span>
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Mostrar</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              table.setPageIndex(0)
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[10, 20, 30, 40, 50].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">registros</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            {'<'}
          </button>
          <span className="flex items-center gap-1 text-sm text-gray-700">
            <div>Página</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </strong>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentsTable 