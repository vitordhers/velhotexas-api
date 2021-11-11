import { Order } from "src/orders/models/order.model";
import { header } from "./header.function.template";
import { footer } from "./footer.constant.template";
import { OrderStatus } from "../../orders/enums/order-status.enum";

export function newOrderContent(
  link: string,
  order: Order,
  password?: boolean
): string {
  let mail = header("Atualização de pedido");
  mail += `
    <body style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
            <tr>
                <td style="padding: 10px 0 30px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                        <tr>
                            <td align="center" bgcolor="#551900" style="padding: 40px 0 30px 0; color: #000000; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
                                <img src="https://lh5.googleusercontent.com/PI_bMu99xWOfkaZob-G9ONj3faAVKskPlcundKzDzOSso8ekb-CrCFP5kjiAi_YYIlJYBMx62wYJF5vMcrze=w1366-h627" alt="Rréi com revórvare" width="300" height="230" style="display: block;" />
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="color: #000000; font-family: Arial, sans-serif; font-size: 24px;">`;
  if (order.status === OrderStatus.PENDING_PAYMENT) {
    mail += `                            <b>Seu pedido foi realizado com sucesso! 🤠</b>`;
  } else {
    mail += `                            <b>O pagamento do seu pedido foi realizado com sucesso! 🤠</b>`;
  }
  mail += `
                                        </td>
                                    </tr>
                                </table>
                                <table>
                                    <tr style="color: #000000; font-family: Arial, sans-serif;">
                                        <td>
                                            <p style="font-size: 24px;margin:18px 0px 10px 0px;font-weight: 500;line-height: 1.2;">🔍 Detalhes do Pedido</p>
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>`;
  if (order.status === OrderStatus.PENDING_PAYMENT) {
    mail += `                           🟡 <b>Status </b> <div style="display: inline-block;padding: 0 25px;height:30px;line-height: 30px;border-radius: 25px;background-color: #d1d1d1;">⚠️ Pagamento do boleto pendente.</div>
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                            <small>O boleto bancário pode demorar até 3 dias 📅 para ser compensado.</small>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                        <a href="#" style="display: inline-block;padding: 0 25px;height:30px;line-height:30px;border-radius:5px;background-color:#f9d388;color:black; text-align: center;  text-decoration: none;  display: inline-block;">🧾 Ver Boleto</a>`;
  } else {
    mail += `🟢 <b>Status </b> <div style="display: inline-block;padding: 0 25px;height:30px;line-height: 30px;border-radius: 25px;background-color: #28a745;">👍 Pedido Pago! Envio pendente.</div>`;
  }

  mail += `
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                        <b>📌Entrega</b>
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                            ${order.freight.address.street}, nº ${order.freight.address.no} - CEP: ${order.freight.address.postalCode}, ${order.freight.address.city} - ${order.freight.address.state}. 
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                        <b>📦Produtos</b>
                                        </td>
                                    </tr>
                                </table>`;
  mail += `
                                <table>
                                    `;
  order.products.forEach((product) => {
    mail += `
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td style="text-align:center">
                                            <img height="48" width="48" style="margin: auto;" src="url(${
                                              process.env.APP_URL
                                            }/assets/img/products/${
      product.brand
    }/${product.id}/1_thumb.png)"/>
                                        </td>
                                        <td>
                                            <div style="text-align: center;padding: 19px 15px;">
                                                ${product.quantity} x ${
      product.quantity > 1 ? product.unit[1] : product.unit[0]
    }
                                            </div>
                                        </td>
                                        <td>
                                            <div style="text-align: center;padding: 19px 15px;">
                                                ${product.title}
                                            </div>
                                        </td>
                                        <td>
                                            <div style="text-align: center;padding: 19px 15px;">
                                            ${String(
                                              product.price.toFixed(2)
                                            ).replace(".", ",")}
                                            </div>
                                        </td>
                                    </tr>`;
  });

  mail += `                       <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td colspan="2">
                                        </td>
                                        <td style="text-align: right;">
                                            Produtos:
                                        </td>
                                        <td style="text-align: center;border-top:groove;">
                                            <b>R$ ${String(
                                              order.charges.totalProducts.toFixed(
                                                2
                                              )
                                            ).replace(".", ",")}</b>
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td colspan="2">
                                            <b>🚚Envio</b>
                                        </td>
                                        <td style="text-align: right;">
                                            por Sedex:
                                        </td>
                                        <td style="text-align: center;">
                                            <b>R$ ${String(
                                              order.charges.totalShipment.toFixed(
                                                2
                                              )
                                            ).replace(".", ",")}</b>
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td colspan="3">
                                            <b>💲Total</b>
                                        </td>
                                        <td style="text-align: center;">
                                            <b>R$ ${String(
                                              order.charges.charge.amount.toFixed(
                                                2
                                              )
                                            ).replace(".", ",")}</b>
                                        </td>
                                    </tr>
                                </table>
                                <table>`;
  if (password) {
    mail += `
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                            👉 Caso ainda num tenha cadastrado uma senha, no botão abaixo você também pode cadastrar, para as próximas vezes que utilizar o Velho Texas.
                                        </td>
                                    </tr>`;
  }
  mail += `
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                            <h3>Para ver seu pedido com mais detalhes, é só clicá aí embaixo 👇</h3>
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 20px; line-height: 20px;">
                                        <td>
                                            <a href="${link}" style="color: #fff !important;text-transform:uppercase;text-decoration: none;background: #5a1f01;padding: 20px;border-radius: 5px;display: inline-block;border: none;">
                                                📃 Ver meu Pedido!
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>`;
  mail += footer;

  return mail;
}
