export const SUCCESS = 200
export const APP_CUSTOM_DATA = {
  id: 'affiliates',
  fields: ['affiliateId'],
  major: 0,
}

export const ERRORS = {
  missingAuthentication: {
    status: 401,
    message: 'Missing appKey or appToken',
  },
  forbidden: {
    status: 403,
    message: 'Forbidden',
  },
}

export const SCROLL_PAGE_SIZE = 1000

export const MD = {
  AFFILIATES: {
    entity: process.env.AFFILIATES_ENTITY ?? 'affiliates',
    schema: process.env.AFFILIATES_SCHEMA ?? '2.3.0',
  },
  USER_AFFILIATION: {
    entity: process.env.USER_AFFILIATION_ENTITY ?? 'userAffiliation',
    schema: process.env.USER_AFFILIATION_SCHEMA ?? '2.3.0',
  },
  COMMISSION: {
    entity: process.env.AFFILIATES_COMMISSION_ENTITY
      ?? 'vtex_affiliates_commission_service_commissionBySKU',
    schema: process.env.AFFILIATES_COMMISSION_SCHEMA ?? '2.3.0',
  },
  ORDERS: {
    entity: process.env.AFFILIATES_ORDERS_ENTITY
      ?? 'vtex_affiliates_commission_service_affiliatesOrders',
    schema: process.env.AFFILIATES_ORDERS_SCHEMA ?? '2.3.0',
  },
} as const