import { header } from "./header.function.template"
import { footer } from "./footer.constant.template";

export function confirmEmail(link: string, resend: boolean) {
    let html = header('Confirme seu e-mail, Roy');

    html += `
    <body style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
            <tr>
                <td style="padding: 10px 0 30px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">      
                        ${!resend ? `
                        <tr>
                            <td align="center" bgcolor="#551900" style="padding: 40px 0 30px 0; color: #000000; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
                                <img src="https://lh5.googleusercontent.com/PI_bMu99xWOfkaZob-G9ONj3faAVKskPlcundKzDzOSso8ekb-CrCFP5kjiAi_YYIlJYBMx62wYJF5vMcrze=w1366-h627" alt="Rréi com revórvare" width="300" height="230" style="display: block;" />
                            </td>
                        </tr>
                        `: ''}
                        <tr>
                            <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">                   
                                    <tr>
                                        <td style="color: #000000; font-family: Arial, sans-serif; font-size: 24px;">
                                            <b>${!resend ? '🤠 Seja bem-vindo ao Velho Texas, caubói!' : '📧 Você solicitou um novo e-mail de confirmação!'}</b>
                                        </td>
                                    </tr>
                                    ${!resend ? `
                                    <tr>
                                        <td style="color: #000000; font-family: Arial, sans-serif; font-size: 14px;">
                                            <small> Mas não faça movimentos bruscos! 🤨</small>
                                        </td>
                                    </tr>` : ''}
                                    <tr>
                                        <td style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                            ${!resend ? 'Sua peregrinação trouxe você para a loja mais QUÉUNTRY 🌵 do Velho Oeste.<br> O xerife ainda exije que você confirme seu e-mail, <b>clicando no botão abaixo, rapaiz</b>! 👇' : 'Só <b>clicar no botão abaixo, rapaiz</b>! 👇'}
                                        </td>
                                    </tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 20px; line-height: 20px;">
                                        <td>
                                            <a href="${link}" style="color: #fff !important;text-transform:uppercase;text-decoration: none;background: #5a1f01;padding: 20px;border-radius: 5px;display: inline-block;border: none;">
                                            ✔️ Confirmar meu e-mail!
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>`;
    html += footer
    return html;
}