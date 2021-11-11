import MelhorEnvioOrder from "./melhor-envio-order.interface";

export default interface CheckoutReponse {
    purchase: {
        id: string,
        protocol: string,
        total: number,
        discount: number,
        status: string,
        paid_at: string,
        canceled_at: null,
        created_at: string,
        updated_at: '2021-02-03 04:10:01',
        payment: null,
        transactions: any[],
        orders: MelhorEnvioOrder[],
        paypal_discounts: []
    },
    digitable: null,
    redirect: null,
    message: null,
    token: null,
    payment_id: null
}