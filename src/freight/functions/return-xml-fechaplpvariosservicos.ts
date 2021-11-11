import { Order } from "src/orders/models/order.model";
import { User } from "src/shared/models/user.model";
import { BuscaCepResponse } from "../interfaces/buscacep-response-interface";

export async function xml(
    cartaoPostagem: string,
    numeroContrato: string,
    codAdministrativo: string,
    etiqueta: string,
    mode: 'sedex' | 'pac',
    order: Order,
    user: User,
    buscaCep: BuscaCepResponse
) {
    return `
    <?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>
    <correioslog>
        <tipo_arquivo>Postagem</tipo_arquivo>
        <versao_arquivo>2.3</versao_arquivo>
        <plp>
            <id_plp />
            <valor_global/>
            <mcu_unidade_postagem/>
            <nome_unidade_postagem/>
            <cartao_postagem>${cartaoPostagem}</cartao_postagem>
        </plp>
        <remetente>
            <numero_contrato>${numeroContrato}</numero_contrato>
            <numero_diretoria>74</numero_diretoria>
            <codigo_administrativo>${codAdministrativo}</codigo_administrativo>
            <nome_remetente>
                <![CDATA[VITOR HUGO MEDEIROS DHERS]]>
            </nome_remetente>
            <logradouro_remetente>
                <![CDATA[Avenida Dois Córregos]]>
            </logradouro_remetente>
            <numero_remetente>1865</numero_remetente>
            <complemento_remetente>
                <![CDATA[Kitnet 204]]>
            </complemento_remetente>
            <bairro_remetente>
                <![CDATA[Dois Córregos]]>
            </bairro_remetente>
            <cep_remetente><![CDATA[13420835]]></cep_remetente>
            <cidade_remetente>
                <![CDATA[Piracicaba]]>
            </cidade_remetente>
            <uf_remetente>SP</uf_remetente>
            <telefone_remetente/>
            <fax_remetente/>
            <email_remetente>
                <![CDATA[vitor.dhers@gmail.com]]>
            </email_remetente>
            <celular_remetente>
                <![CDATA[19991556016]]>
            </celular_remetente>
            <cpf_cnpj_remetente>
                <![CDATA[37221503000105]]>
            </cpf_cnpj_remetente>
            <ciencia_conteudo_proibido>S</ciencia_conteudo_proibido>
        </remetente>
        <forma_pagamento/>
        <objeto_postal>
            <numero_etiqueta>${etiqueta}</numero_etiqueta>
            <codigo_objeto_cliente/>
            <codigo_servico_postagem>${mode === 'sedex' ? '162008' : '162011'}</codigo_servico_postagem>
            <cubagem>0,00</cubagem>
            <peso>${order.freight.shippingWeight}</peso>
            <rt1/>
            <rt2/>
            <restricao_anac/>
            <destinatario>
                <nome_destinatario>
                    <![CDATA[${user.name}]]>
                </nome_destinatario>
                <telefone_destinatario/>
                <celular_destinatario>
                    <![CDATA[${user.celphoneNumber ? user.celphoneNumber : ''}]]>
                </celular_destinatario>
                <email_destinatario>
                    <![CDATA[${user.email}]]>
                </email_destinatario>
                <logradouro_destinatario>
                    <![CDATA[${buscaCep.end}]]>
                </logradouro_destinatario>
                <complemento_destinatario>
                    <![CDATA[${order.freight.address.addInfo ? order.freight.address.addInfo : ''}]]>
                </complemento_destinatario>
                <numero_end_destinatario>${order.freight.address.no}</numero_end_destinatario>
                <cpf_cnpj_destinatario/>
            </destinatario>
            <nacional>
                <bairro_destinatario>
                <![CDATA[${buscaCep.bairro}]]>
                </bairro_destinatario>
                <cidade_destinatario>
                <![CDATA[${buscaCep.cidade}]]>
                </cidade_destinatario>
                <uf_destinatario>
                    ${buscaCep.uf}
                </uf_destinatario>
                <cep_destinatario>
                <![CDATA[${buscaCep.cep}]]>
                </cep_destinatario>
                <codigo_usuario_postal/>
                <centro_custo_cliente/>
                <numero_nota_fiscal/>
                <serie_nota_fiscal/>
                <valor_nota_fiscal/>
                <natureza_nota_fiscal/>
                <descricao_objeto/>
                <valor_a_cobrar>0,0</valor_a_cobrar>
            </nacional>
            <servico_adicional>
                <codigo_servico_adicional>025</codigo_servico_adicional>
            </servico_adicional>
            <dimensao_objeto>
                <tipo_objeto>002</tipo_objeto>
                <dimensao_altura>50,00</dimensao_altura>
                <dimensao_largura>30,00</dimensao_largura>
                <dimensao_comprimento>60,00</dimensao_comprimento>
                <dimensao_diametro>0,00</dimensao_diametro>
            </dimensao_objeto>
            <data_postagem_sara/>
            <status_processamento>0</status_processamento>
            <numero_comprovante_postagem/>
            <valor_cobrado/>
        </objeto_postal>
    </correioslog>
    `;
}