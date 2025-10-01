import { json as parseJson } from 'co-body';

interface CommissionUpdateRequest {
  skuId: string
  commission: number
  refId?: string
}

export default async function updateCommissionToSku(ctx: Context, next: () => Promise<any>) {
    const {
        clients: { masterData },
        vtex: { logger } 
    } = ctx;

    ctx.set('Cache-Control', 'no-store');

    try {
        logger.info({
            where: 'updateCommissionToSku:pre-parse',
            contentType: ctx.request.type,
            contentLength: ctx.request.length,
            hasParsedBody: (ctx.request as any).body !== undefined,
            method: ctx.request.method,
            url: ctx.request.url
        });

        let reqBody = (ctx.request as any).body as CommissionUpdateRequest | undefined;

        if (reqBody === undefined) {
            reqBody = await parseJson(ctx.req).catch(() => undefined) as CommissionUpdateRequest | undefined;
        }

        if (!reqBody) {
            ctx.status = 400;
            ctx.body = { success: false, error: 'Body inválido ou ausente. Envie JSON no corpo da requisição.' };
            return;
        }
        
        const skuId = (reqBody.skuId ?? '').toString().trim();
        const commissionNum = typeof reqBody.commission === 'string' ? Number(reqBody.commission) : reqBody.commission;

        if(!skuId) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: "O ID do SKU é obrigatório"
            };
            await next();
            return;
        }

        if(commissionNum === undefined || commissionNum === null) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'O valor da comissão é obrigatório'
            };
            await next();
            return;
        }

        const commission = Number(commissionNum);
        if(!Number.isFinite(commission) || commission < 0 || commission > 100) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'O valor da comissão precisa ser um número entre 0 e 100'
            };
            await next();
            return;
        }

        const documentId = skuId;
        const normalizedCommission = Math.round(commission * 100) / 100;
        const requestBody = {
            id: documentId,
            dataEntityId: "vtex_affiliates_commission_service_commissionBySKU",
            accountId: "7f4bec380a054272bdeee6e8f453e99d",
            accountName: "delivo",
            followers: [],
            schemas: [
                "0.23.4",
                "2.2.1",
                "2.2.2",
                "2.2.3",
                "2.3.0"
            ],
            commission: normalizedCommission,
            refId: "",
            createdBy: "354bc896-6394-4e29-a137-6bb130a1f334",
            createdBy_USER: {
                Id: "354bc896-6394-4e29-a137-6bb130a1f334",
                Login: "vrn--vtexsphinx--aws-us-east-1--positivaeco--master--vtex.affiliates-commission-service@2.3.0",
                Name: null
            },
            createdIn: "2025-03-17T15:54:03.5718218Z",
            lastInteractionBy: "354bc896-6394-4e29-a137-6bb130a1f334",
            lastInteractionBy_USER: {
                Id: "354bc896-6394-4e29-a137-6bb130a1f334",
                Login: "vrn--vtexsphinx--aws-us-east-1--positivaeco--master--vtex.affiliates-commission-service@2.3.0",
                Name: null
            },
            lastInteractionIn: "2025-03-18T14:14:26.1121164Z",
            tags: [],
            dataInstanceId: documentId,
            updatedBy: "354bc896-6394-4e29-a137-6bb130a1f334",
            updatedBy_USER: {
                Id: "354bc896-6394-4e29-a137-6bb130a1f334",
                Login: "vrn--vtexsphinx--aws-us-east-1--positivaeco--master--vtex.affiliates-commission-service@2.3.0",
                Name: null
            },
            updatedIn: "2025-03-18T14:14:26.1121164Z"
        };

        logger.info({
            message: 'Comissão atualizada',
            skuId: documentId,
            commission
        });

        const response = await masterData.updateCommissionBySKU(documentId, requestBody);

        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                ...response,
                skuId: documentId,
                commission,
                refId: documentId
            },
            message: `A comissão para o SKU ${documentId} foi alterada com sucesso para ${commission}%`
        };

        logger.info({
            message: 'Comissão atualizada com sucesso',
            skuId: documentId,
            commission
        })
    } catch (error) {
        logger.error({
            message: 'Erro ao atualizar a comissão',
            error: error.message,
            stack: error.stack,
        })

        ctx.status = error.response?.status || 500
        ctx.body = {
            success: false,
            error: error.message || 'Internal server error',
            details: error.response?.data || null
        }
    }
}