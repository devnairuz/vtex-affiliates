import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

interface MasterDataResponse {
  Id: string
  Href: string
  DocumentId: string
  [key: string]: any
}

export class MasterDataClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.vtexcommercestable.com.br/api`, context, {
      ...options,
      headers: {
        ...options?.headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'VtexIdclientAutCookie': context.authToken,
        'Proxy-Authorization': context.authToken,
        'X-Vtex-Use-Https': 'true'
      },
    })
  }

  public async updateCommissionBySKU(documentId: string, data: any): Promise<MasterDataResponse> {
    return this.http.put(
      `/dataentities/vtex_affiliates_commission_service_commissionBySKU/documents/${documentId}`,
      data,
      {
        metric: 'masterdata-update-commission',
      }
    )
  }
}