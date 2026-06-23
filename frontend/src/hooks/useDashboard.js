import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/client'
import api from '../api/client'

export function useCacheStatus() {
  return useQuery({
    queryKey: ['cacheStatus'],
    queryFn: () => api.get('/cache/status').then(r => r.data),
    refetchInterval: 60_000,   // check every minute
    staleTime: 30_000,
  })
}

export function useFilters() {
  return useQuery({
    queryKey: ['filters'],
    queryFn: dashboardApi.getFilters,
    staleTime: 60_000,   // 1 daqiqa — toggle qilingandan keyin refetch bo'lsin
  })
}

export function useOverview(filters) {
  return useQuery({
    queryKey: ['overview', filters],
    queryFn: () => dashboardApi.getOverview(filters),
    enabled: true,
  })
}

export function useShops(filters) {
  return useQuery({
    queryKey: ['shops', filters],
    queryFn: () => dashboardApi.getShops(filters),
  })
}

export function useStalls(filters) {
  return useQuery({
    queryKey: ['stalls', filters],
    queryFn: () => dashboardApi.getStalls(filters),
  })
}

export function useOpenTrade(filters) {
  return useQuery({
    queryKey: ['openTrade', filters],
    queryFn: () => dashboardApi.getOpenTrade(filters),
  })
}

export function useDebts(filters) {
  return useQuery({
    queryKey: ['debts', filters],
    queryFn: () => dashboardApi.getDebts(filters),
  })
}

export function useTopDebtors(filters) {
  return useQuery({
    queryKey: ['topDebtors', filters],
    queryFn: () => dashboardApi.getTopDebtors(filters),
  })
}

export function useVehicleEntries(filters) {
  return useQuery({
    queryKey: ['vehicleEntries', filters],
    queryFn: () => dashboardApi.getVehicleEntries(filters),
  })
}
