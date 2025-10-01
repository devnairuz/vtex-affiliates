import type { QueryGetAffiliateArgs } from 'delivo.affiliates'

export const getAffiliate = async (
  _: unknown,
  { affiliateId }: QueryGetAffiliateArgs,
  { clients: { affiliates } }: Context
) => {
  const fields = ['_all']

  return affiliates.get(affiliateId, fields)
}
