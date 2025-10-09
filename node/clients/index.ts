import { IOClients } from '@vtex/api'
import { masterDataFor } from '@vtex/clients'

import type { Affiliates, UserAffiliation } from '../typings/affiliates'
import AuthenticationClient from './authenticationClient'
import CheckoutExtended from './checkout'
import IdentityClient from './IdentityClient'
import VtexId from './vtexId'
import { MasterDataClient } from './masterdataClient';

import { withCustomSchema } from '../utils/withCustomSchema'

import { MD } from '../utils/constants'

export class Clients extends IOClients {
  public get affiliates() {
    return this.getOrSet( 'affiliates', withCustomSchema(MD.AFFILIATES.schema, masterDataFor<Affiliates>(MD.AFFILIATES.entity)) )
  }

  public get userAffiliation() {
    return this.getOrSet('userAffiliation', withCustomSchema(MD.USER_AFFILIATION.schema, masterDataFor<UserAffiliation>(MD.USER_AFFILIATION.entity))
    )
  }

  public get checkout() {
    return this.getOrSet('checkout', CheckoutExtended)
  }

  public get authentication() {
    return this.getOrSet('authentication', AuthenticationClient)
  }

  public get identity() {
    return this.getOrSet('identity', IdentityClient)
  }

  public get vtexId() {
    return this.getOrSet('vtexId', VtexId)
  }

  public get masterData() {
    return this.getOrSet("masterData", MasterDataClient);
  }
}
