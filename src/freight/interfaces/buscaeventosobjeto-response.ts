export interface BuscaEventosObjetoResponse {
    numero: string,
    sigla: string,
    nome: string,
    categoria: string,
    evento: {
        tipo: string,
        status: string,
        data: string,
        hora: string,
        descricao: string,
        local: string,
        codigo: string,
        cidade: string,
        uf: string
    }
}