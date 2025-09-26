import type { EventContext } from '@vtex/api'
import type { App } from '@vtex/clients'

import type { Clients } from '../clients'
import { APP_CUSTOM_DATA } from '../utils/constants'

export async function setupAppConfiguration(ctx: EventContext<Clients>) {
  const {
    clients: { checkout, masterdata },
    vtex: { logger },
  } = ctx

  const currentCheckoutConfig = await checkout.getOrderFormConfiguration()

  const isAppAlreadySet = currentCheckoutConfig.apps.some(
    (app: App) => app.id === APP_CUSTOM_DATA.id
  )

  if (isAppAlreadySet) {
    return
  }

  try {
    await checkout.setOrderFormConfiguration({
      ...currentCheckoutConfig,
      apps: [...currentCheckoutConfig.apps, APP_CUSTOM_DATA],
    })
    logger.info({
      metric: 'setup-app-config',
      message: 'App sucessfully configured',
    })


    // --- Inicialização dos Schemas de MasterData ---
    const schemaName = '2.3.0' // Ajuste se necessário

    // Função auxiliar para adicionar field se não existir
    const addFieldIfMissing = (
      schemaBody: SchemaBody,
      fieldName: string,
      fieldDef: { type: string; format?: string; maxLength?: number },
      makeRequired: boolean = true,
      makeIndexed: boolean = true
    ) => {
      if (!schemaBody.properties[fieldName]) {
        schemaBody.properties[fieldName] = fieldDef
      }
      if (makeRequired && !schemaBody.required.includes(fieldName)) {
        schemaBody.required.push(fieldName)
      }
      if (makeIndexed && !schemaBody['v-indexed'].includes(fieldName)) {
        schemaBody['v-indexed'].push(fieldName)
      }
      return schemaBody
    }

    // Interface para SchemaBody (baseada em VTEX JSON Schema)
    interface SchemaBody {
      $schema: string
      title: string
      type: string
      properties: Record<string, { type: string; format?: string; items?: any }>
      required: string[]
      'v-indexed': string[]
      'v-cache': boolean
      'v-triggers': any[]
    }

    // --- Entidade: affiliates_affiliates ---
    let affiliatesSchema: SchemaBody
    try {
      affiliatesSchema = await masterdata.getSchema({ dataEntity: 'affiliates_affiliates', schema: schemaName })
    } catch (e) {
      affiliatesSchema = {
        $schema: 'http://json-schema.org/schema#',
        title: 'Affiliates',
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['name', 'email'],
        'v-indexed': ['name', 'email'],
        'v-cache': false,
        'v-triggers': [],
      }
    }
    affiliatesSchema = addFieldIfMissing(
      affiliatesSchema,
      'slug',
      { type: 'string', maxLength: 255 },
      true,
      true
    )
    await masterdata.createOrUpdateSchema({
      dataEntity: 'affiliates_affiliates',
      schemaName,
      schemaBody: affiliatesSchema,
    })

    // --- Entidade: commissionBySKU ---
    let commissionBySKUSchema: SchemaBody
    try {
      commissionBySKUSchema = await masterdata.getSchema({ dataEntity: 'commissionBySKU', schema: schemaName })
    } catch (e) {
      commissionBySKUSchema = {
        $schema: 'http://json-schema.org/schema#',
        title: 'Commission By SKU',
        type: 'object',
        properties: {
          commission: { type: 'number' },
          refId: { type: 'string' },
        },
        required: ['commission'],
        'v-indexed': ['refId', 'commission'],
        'v-cache': false,
        'v-triggers': [],
      }
    }
    await masterdata.createOrUpdateSchema({
      dataEntity: 'commissionBySKU',
      schemaName,
      schemaBody: commissionBySKUSchema,
    })

    // --- Entidade: affiliatesOrders ---
    let affiliatesOrdersSchema: SchemaBody
    try {
      affiliatesOrdersSchema = await masterdata.getSchema({ dataEntity: 'affiliatesOrders', schema: schemaName })
    } catch (e) {
      affiliatesOrdersSchema = {
        $schema: 'http://json-schema.org/schema#',
        title: 'AffiliatesOrders',
        type: 'object',
        properties: {
          affiliateId: { type: 'string' },
          status: { type: 'string' },
          userEmail: { type: 'string' },
          orderTotal: { type: 'number' },
          orderTotalCommission: { type: 'number' },
          orderDate: { type: 'string', format: 'date-time' },
          orderItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                skuId: { type: 'string' },
                skuName: { type: 'string' },
                skuImageUrl: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number' },
                commission: { type: 'number' },
              },
              required: ['skuId', 'skuName', 'price', 'quantity', 'commission'],
            },
          },
        },
        required: ['affiliateId', 'userEmail', 'orderItems'],
        'v-indexed': [
          'affiliateId',
          'userEmail',
          'status',
          'orderDate',
          'orderTotal',
          'orderTotalCommission',
        ],
        'v-cache': false,
        'v-triggers': [],
      }
    }
    await masterdata.createOrUpdateSchema({
      dataEntity: 'affiliatesOrders',
      schemaName,
      schemaBody: affiliatesOrdersSchema,
    })

    logger.info({
      metric: 'setup-app-config',
      message: 'Schemas inicializados com sucesso para affiliates, commissionBySKU e affiliatesOrders.',
    })


  } catch (err) {
    logger.error({
      metric: 'setup-app-config',
      message: err.message,
    })
    throw new Error('Error setting app configurations')
  }
}
