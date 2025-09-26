import type { MutationAddAffiliateArgs } from 'agencianairuzpartnerbr.affiliates'
import CustomGraphQLError from '@vtex/api/lib/errors/customGraphQLError'

import type { Affiliates } from '../typings/affiliates'
import { findDocumentsByField, isSlugValid } from '../utils/shared'
import type { Error } from './pushErrors'
import { pushErrors } from './pushErrors'

function logAxiosError(prefix: string, err: any, extra?: any) {
  // tudo no terminal
  console.error(`❌ ${prefix}`)
  console.error('Status:', err?.response?.status)
  console.error('URL:', err?.config?.url)
  if (err?.config?.params) console.error('Params:', err.config.params)
  if (err?.config?.data) console.error('Body:', err.config.data)
  console.error('Data:', typeof err?.response?.data === 'string'
    ? err.response.data
    : JSON.stringify(err?.response?.data, null, 2))
  if (extra) console.error('Extra:', JSON.stringify(extra, null, 2))
}

export const addAffiliate = async (
  _: unknown,
  { newAffiliate }: MutationAddAffiliateArgs,
  { clients: { affiliates } }: Context
) => {
  const { slug, email } = newAffiliate
  const errors: Error[] = []

  if (!isSlugValid(slug)) {
    pushErrors(
      {
        message: 'Slug is not valid, must be alphanumeric',
        code: 'SlugNotAlphanumeric',
      },
      errors
    )
  }

  console.log('AQUI IMPRIME NO CONSOLE')

  let affiliatesInDbBySlug
  try {
    affiliatesInDbBySlug = await findDocumentsByField<Affiliates>(affiliates, 'slug', slug)
  } catch (err) {
    logAxiosError('Falha na busca por slug no MD', err, { field: 'slug', value: slug })
    throw err // mantém o comportamento atual
  }

  console.log('PASSOU DA BUSCA POR SLUG')

  if (affiliatesInDbBySlug?.length > 0) {
    pushErrors(
      {
        message: 'Affiliate url is already in use',
        code: 'URLInUse',
      },
      errors
    )
  }

  const affiliatesInDbByEmail = await findDocumentsByField<Affiliates>(
    affiliates,
    'email',
    email
  )

  if (affiliatesInDbByEmail?.length > 0) {
    pushErrors(
      {
        message: 'Affiliate already exists (email is already in use)',
        code: 'AffiliateAlreadyExists',
      },
      errors
    )
  }

  if (errors.length >= 1) {
    throw new CustomGraphQLError('Add Affiliate validation error', errors)
  }

  const mdDocument = {
    ...newAffiliate,
  } as Affiliates

  const { DocumentId } = await affiliates.save(mdDocument)

  return affiliates.get(DocumentId, ['_all'])
}
