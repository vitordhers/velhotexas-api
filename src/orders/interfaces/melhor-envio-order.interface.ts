export default interface MelhorEnvioOrder {
    id: string,
    protocol: string,
    service_id: number,
    agency_id: number | null,
    contract: string,
    service_code: null,
    quote: number,
    price: number,
    coupon: null,
    discount: number,
    delivery_min: number,
    delivery_max: number,
    status: string,
    reminder: null,
    insurance_value: number,
    weight: null,
    width: null,
    height: null,
    length: null,
    diameter: null,
    format: string,
    billed_weight: number,
    receipt: boolean,
    own_hand: boolean,
    collect: boolean,
    collect_scheduled_at: null,
    reverse: boolean,
    non_commercial: boolean,
    authorization_code: null,
    tracking: null,
    self_tracking: null,
    delivery_receipt: null,
    additional_info: null,
    cte_key: null,
    paid_at: string,
    generated_at: null,
    posted_at: null,
    delivered_at: null,
    canceled_at: null,
    suspended_at: null,
    expired_at: null,
    created_at: string,
    updated_at: string,
    parse_pi_at: null,
    from: {
        name: string,
        phone: string,
        email: string,
        document: string,
        company_document: null,
        state_register: null,
        postal_code: string,
        address: string,
        location_number: string,
        complement: string,
        district: string,
        city: string,
        state_abbr: string,
        country_id: string,
        latitude: null,
        longitude: null,
        note: null
    },
    to: {
        name: string,
        phone: string,
        email: string,
        document: string,
        company_document: null,
        state_register: null,
        postal_code: string,
        address: string,
        location_number: string,
        complement: null,
        district: null,
        city: string,
        state_abbr: string,
        country_id: string,
        latitude: null,
        longitude: null,
        note: null
    },
    service: {
        id: number,
        name: string,
        status: string,
        type: string,
        range: string,
        restrictions: string,
        requirements: string,
        optionals: string,
        company: {
            id: number,
            name: string,
            status: string,
            picture: string,
            use_own_contract: false
        }
    },
    agency: null,
    invoice: null,
    tags: [
        {
            tag: string,
            url: string
        }
    ],
    products: [
        {
            name: string,
            quantity: number,
            unitary_value: number,
            weight: number | null
        }
    ],
    generated_key: null
}