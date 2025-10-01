import type { AffiliatesFilterInput } from 'delivo.affiliates'

export const parseAffiliatesFilters = ({
  searchTerm,
  isApproved,
  affiliateList,
}: AffiliatesFilterInput) => {
  const where = []
  const affiliateIdFilter: string[] = []

  if (searchTerm) {
    where.push(
      `(id="*${searchTerm}*" OR slug="*${searchTerm}*" OR storeName="*${searchTerm}*" OR email="*${searchTerm}*" OR name="*${searchTerm}*" OR phone="*${searchTerm}*")`
    )
  }

  if (affiliateList && !searchTerm) {
    affiliateList.map((id: string | null) => id && id !== '' && affiliateIdFilter.push(`id=${id}`))
    const joinaffiliateIdFilter = `(${affiliateIdFilter.join(' OR ')})`

    where.push(joinaffiliateIdFilter)
  }

  if (isApproved !== undefined && isApproved !== null) {
    where.push(`isApproved=${isApproved}`)
  }

  return where.join(' AND ')
}
