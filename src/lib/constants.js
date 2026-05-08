/**
 * Constantes globais da aplicação
 */

export const APP_NAME = 'FleetFlow'
export const APP_DESCRIPTION = 'Sistema de Gerenciamento de Frota Veicular'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  VEHICLES_NEW: '/vehicles/new',
  VEHICLES_DETAIL: '/vehicles/:id',
  ANALYTICS: '/analytics',
  MAINTENANCE: '/maintenance',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
}

export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
  SOLD: 'sold',
}

export const VEHICLE_STATUS_LABELS = {
  [VEHICLE_STATUS.ACTIVE]: 'Ativo',
  [VEHICLE_STATUS.MAINTENANCE]: 'Em Manutenção',
  [VEHICLE_STATUS.INACTIVE]: 'Inativo',
  [VEHICLE_STATUS.SOLD]: 'Vendido',
}

export const FUEL_TYPES = {
  GASOLINE: 'gasoline',
  DIESEL: 'diesel',
  FLEX: 'flex',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
}

export const FUEL_TYPE_LABELS = {
  [FUEL_TYPES.GASOLINE]: 'Gasolina',
  [FUEL_TYPES.DIESEL]: 'Diesel',
  [FUEL_TYPES.FLEX]: 'Flex',
  [FUEL_TYPES.ELECTRIC]: 'Elétrico',
  [FUEL_TYPES.HYBRID]: 'Híbrido',
}

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DRIVER: 'driver',
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
}

export const QUERY_KEYS = {
  VEHICLES: 'vehicles',
  VEHICLE: 'vehicle',
  VEHICLE_STATS: 'vehicleStats',
  USER_PROFILE: 'userProfile',
}