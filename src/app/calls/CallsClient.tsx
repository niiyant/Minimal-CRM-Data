'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Call } from '@/app/types/calls'
import CallsFilters from './CallsFilters'

type TimeUnit = 'seg' | 'min' | 'hrs' | 'dias'

interface CallMetrics {
  totalCalls: number;
  totalDuration: number;
  avgDuration: number;
  avgResponseTime: number;
  receivedCalls: number;
  answeredCalls: number;
  madeCalls: number;
  avgCallsPerLead: number;
}

interface LocationMetrics extends CallMetrics {
  location_name: string;
}

interface CallsClientProps {
  initialCalls: Call[];
  contactCreationDates: Record<string, string>;
}

// Función para parsear fechas del input como locales
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export default function CallsClient({ initialCalls, contactCreationDates }: CallsClientProps) {
  const [calls] = useState<Call[]>(initialCalls)
  const [filters, setFilters] = useState({
    location: '',
    startDate: '',
    endDate: ''
  })
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('seg')

  const convertTime = (seconds: number): number => {
    switch (timeUnit) {
      case 'min':
        return Math.round(seconds / 60)
      case 'hrs':
        return Math.round(seconds / 3600)
      case 'dias':
        return Math.round(seconds / 86400)
      default:
        return seconds
    }
  }

  const getTimeUnitLabel = (): string => {
    switch (timeUnit) {
      case 'min':
        return 'min'
      case 'hrs':
        return 'hrs'
      case 'dias':
        return 'días'
      default:
        return 'seg'
    }
  }

  // Filtrar llamadas según los criterios
  const filteredCalls = calls.filter(call => {
    if (filters.location && call.location_name !== filters.location) return false
    
    // Filtros de fecha inicio y fin independientes, usando fechas locales
    if (filters.startDate || filters.endDate) {
      const callStart = call.phone_start_time ? new Date(call.phone_start_time) : null;
      const callEnd = call.phone_end_time ? new Date(call.phone_end_time) : callStart;
      const rangeStart = filters.startDate ? parseLocalDate(filters.startDate) : null;
      const rangeEnd = filters.endDate ? parseLocalDate(filters.endDate) : null;

      if (callStart) callStart.setHours(0,0,0,0);
      if (callEnd) callEnd.setHours(0,0,0,0);
      if (rangeStart) rangeStart.setHours(0,0,0,0);
      if (rangeEnd) rangeEnd.setHours(0,0,0,0);

      // Solo fecha inicio seleccionada
      if (rangeStart && !rangeEnd && callStart) {
        if (callStart < rangeStart) return false;
      }
      // Solo fecha fin seleccionada
      if (!rangeStart && rangeEnd && callEnd) {
        if (callEnd > rangeEnd) return false;
      }
      // Ambas fechas seleccionadas
      if (rangeStart && rangeEnd && callStart && callEnd) {
        if (callStart < rangeStart || callEnd > rangeEnd) return false;
      }
    }
    
    return true
  })

  // Obtener ubicaciones únicas
  const uniqueLocations = Array.from(
    new Set(calls.map(call => call.location_name).filter(Boolean))
  ).map(location_name => ({ location_name: location_name as string }))

  // Calcular métricas globales
  const metrics: CallMetrics = {
    totalCalls: filteredCalls.length,
    totalDuration: filteredCalls.reduce((acc, call) => acc + (call.phone_duration || 0), 0),
    avgDuration: 0,
    avgResponseTime: 0,
    receivedCalls: filteredCalls.filter(call => call.phone_direction === 'inbound').length,
    answeredCalls: filteredCalls.filter(call => 
      call.phone_direction === 'inbound' && 
      call.phone_call_status === 'completed'
    ).length,
    madeCalls: filteredCalls.filter(call => call.phone_direction === 'outbound').length,
    avgCallsPerLead: 0
  }

  // Calcular promedios
  if (metrics.totalCalls > 0) {
    metrics.avgDuration = Math.round(metrics.totalDuration / metrics.totalCalls)
  }

  // Calcular tiempo promedio de respuesta
  const responseTimesByContact: Record<string, number[]> = {}
  filteredCalls.forEach(call => {
    if (call.id_contact) {
      const contactCreationDate = contactCreationDates[call.id_contact]
      if (contactCreationDate && call.phone_start_time) {
        const responseTime = new Date(call.phone_start_time).getTime() - new Date(contactCreationDate).getTime()
        if (responseTime > 0) {
          if (!responseTimesByContact[call.id_contact]) {
            responseTimesByContact[call.id_contact] = []
          }
          responseTimesByContact[call.id_contact].push(responseTime)
        }
      }
    }
  })

  // Calcular el promedio de tiempo de respuesta por contacto
  const avgResponseTimes = Object.values(responseTimesByContact).map(times => {
    return times.reduce((sum, time) => sum + time, 0) / times.length
  })

  // Calcular el promedio global
  metrics.avgResponseTime = avgResponseTimes.length > 0
    ? Math.round(avgResponseTimes.reduce((sum, time) => sum + time, 0) / avgResponseTimes.length / 1000)
    : 0

  // Calcular promedio de llamadas por lead
  const uniqueContacts = new Set(filteredCalls.map(call => call.id_contact).filter(Boolean))
  if (uniqueContacts.size > 0) {
    metrics.avgCallsPerLead = Math.round(metrics.totalCalls / uniqueContacts.size)
  }

  // Calcular métricas por ubicación
  const locationMetrics: LocationMetrics[] = filters.location 
    ? [uniqueLocations.find(loc => loc.location_name === filters.location)]
        .filter((loc): loc is { location_name: string } => loc !== undefined)
        .map(loc => {
          const locationCalls = filteredCalls.filter(call => call.location_name === loc.location_name)
          const locationContacts = new Set(locationCalls.map(call => call.id_contact).filter(Boolean))
          
          // Calcular tiempos de respuesta por contacto para esta ubicación
          const locationResponseTimesByContact: Record<string, number[]> = {}
          locationCalls.forEach(call => {
            if (call.id_contact) {
              const contactCreationDate = contactCreationDates[call.id_contact]
              if (contactCreationDate && call.phone_start_time) {
                const responseTime = new Date(call.phone_start_time).getTime() - new Date(contactCreationDate).getTime()
                if (responseTime > 0) {
                  if (!locationResponseTimesByContact[call.id_contact]) {
                    locationResponseTimesByContact[call.id_contact] = []
                  }
                  locationResponseTimesByContact[call.id_contact].push(responseTime)
                }
              }
            }
          })

          // Calcular el promedio de tiempo de respuesta por contacto para esta ubicación
          const locationAvgResponseTimes = Object.values(locationResponseTimesByContact).map(times => {
            return times.reduce((sum, time) => sum + time, 0) / times.length
          })

          // Calcular el promedio para esta ubicación
          const locationAvgResponseTime = locationAvgResponseTimes.length > 0
            ? Math.round(locationAvgResponseTimes.reduce((sum, time) => sum + time, 0) / locationAvgResponseTimes.length / 1000)
            : 0

          return {
            location_name: loc.location_name || 'Sin Ubicación',
            totalCalls: locationCalls.length,
            totalDuration: locationCalls.reduce((acc, call) => acc + (call.phone_duration || 0), 0),
            avgDuration: locationCalls.length > 0 
              ? Math.round(locationCalls.reduce((acc, call) => acc + (call.phone_duration || 0), 0) / locationCalls.length)
              : 0,
            avgResponseTime: locationAvgResponseTime,
            receivedCalls: locationCalls.filter(call => call.phone_direction === 'inbound').length,
            answeredCalls: locationCalls.filter(call => 
              call.phone_direction === 'inbound' && 
              call.phone_call_status === 'completed'
            ).length,
            madeCalls: locationCalls.filter(call => call.phone_direction === 'outbound').length,
            avgCallsPerLead: locationContacts.size > 0
              ? Math.round(locationCalls.length / locationContacts.size)
              : 0
          }
        })
    : uniqueLocations.map(location => {
        const locationCalls = filteredCalls.filter(call => call.location_name === location.location_name)
        const locationContacts = new Set(locationCalls.map(call => call.id_contact).filter(Boolean))
        
        // Calcular tiempos de respuesta por contacto para esta ubicación
        const locationResponseTimesByContact: Record<string, number[]> = {}
        locationCalls.forEach(call => {
          if (call.id_contact) {
            const contactCreationDate = contactCreationDates[call.id_contact]
            if (contactCreationDate && call.phone_start_time) {
              const responseTime = new Date(call.phone_start_time).getTime() - new Date(contactCreationDate).getTime()
              if (responseTime > 0) {
                if (!locationResponseTimesByContact[call.id_contact]) {
                  locationResponseTimesByContact[call.id_contact] = []
                }
                locationResponseTimesByContact[call.id_contact].push(responseTime)
              }
            }
          }
        })

        // Calcular el promedio de tiempo de respuesta por contacto para esta ubicación
        const locationAvgResponseTimes = Object.values(locationResponseTimesByContact).map(times => {
          return times.reduce((sum, time) => sum + time, 0) / times.length
        })

        // Calcular el promedio para esta ubicación
        const locationAvgResponseTime = locationAvgResponseTimes.length > 0
          ? Math.round(locationAvgResponseTimes.reduce((sum, time) => sum + time, 0) / locationAvgResponseTimes.length / 1000)
          : 0

        return {
          location_name: location.location_name || 'Sin Ubicación',
          totalCalls: locationCalls.length,
          totalDuration: locationCalls.reduce((acc, call) => acc + (call.phone_duration || 0), 0),
          avgDuration: locationCalls.length > 0 
            ? Math.round(locationCalls.reduce((acc, call) => acc + (call.phone_duration || 0), 0) / locationCalls.length)
            : 0,
          avgResponseTime: locationAvgResponseTime,
          receivedCalls: locationCalls.filter(call => call.phone_direction === 'inbound').length,
          answeredCalls: locationCalls.filter(call => 
            call.phone_direction === 'inbound' && 
            call.phone_call_status === 'completed'
          ).length,
          madeCalls: locationCalls.filter(call => call.phone_direction === 'outbound').length,
          avgCallsPerLead: locationContacts.size > 0
            ? Math.round(locationCalls.length / locationContacts.size)
            : 0
        }
      })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resumen de Llamadas</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="dias">Días</option>
            <option value="hrs">Horas</option>
            <option value="min">Minutos</option>
            <option value="seg">Segundos</option>
          </select>
          <Link 
            href="/calls/table" 
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ver Tabla Completa
          </Link>
        </div>
      </div>

      {/* Métricas Globales */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {filters.location ? `Métricas de ${filters.location}` : 'Métricas Globales'}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Total de Llamadas</h2>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalCalls}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Tiempo Total en Llamadas</h2>
            <p className="text-3xl font-bold text-blue-600">{convertTime(metrics.totalDuration)} {getTimeUnitLabel()}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Tiempo Promedio de Llamadas</h2>
            <p className="text-3xl font-bold text-blue-600">{convertTime(metrics.avgDuration)} {getTimeUnitLabel()}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Tiempo Promedio de Respuesta</h2>
            <p className="text-3xl font-bold text-blue-600">{convertTime(metrics.avgResponseTime)} {getTimeUnitLabel()}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Llamadas Recibidas</h2>
            <p className="text-3xl font-bold text-blue-600">{metrics.receivedCalls}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Llamadas Contestadas</h2>
            <p className="text-3xl font-bold text-blue-600">{metrics.answeredCalls}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Llamadas Realizadas</h2>
            <p className="text-3xl font-bold text-blue-600">{metrics.madeCalls}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Promedio de Llamadas por Lead</h2>
            <p className="text-3xl font-bold text-blue-600">{metrics.avgCallsPerLead}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <CallsFilters 
        locations={uniqueLocations} 
        filters={filters}
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
                  Total Llamadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tiempo Total ({getTimeUnitLabel()})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tiempo Promedio ({getTimeUnitLabel()})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tiempo Respuesta ({getTimeUnitLabel()})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Recibidas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Contestadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Realizadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Promedio/Lead
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {locationMetrics.map((location) => (
                <tr key={location.location_name} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {location.location_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.totalCalls}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {convertTime(location.totalDuration)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {convertTime(location.avgDuration)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {convertTime(location.avgResponseTime)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.receivedCalls}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.answeredCalls}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.madeCalls}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {location.avgCallsPerLead}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Llamadas Recientes */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {filters.location ? `Llamadas Recientes de ${filters.location}` : 'Llamadas Recientes'}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Duración ({getTimeUnitLabel()})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCalls.slice(0, 5).map((call: Call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {call.full_name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {call.location_name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {call.phone_start_time
                      ? new Date(call.phone_start_time).toLocaleString('es-ES')
                      : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {call.phone_end_time
                      ? new Date(call.phone_end_time).toLocaleString('es-ES')
                      : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {call.phone_duration ? `${convertTime(call.phone_duration)} ${getTimeUnitLabel()}` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {call.phone_call_status || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {call.phone_direction || '-'}
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