export interface BuscaCepResponse {
    cep: string;
    end: string;
    bairro: string;
    cidade: string;
    uf: string;
    complemento?: string;
    complemento2?: string;
    id?: string;
}
