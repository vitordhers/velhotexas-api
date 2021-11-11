import { header } from './header.function.template';
import { footer } from './footer.constant.template';

export function forgotPasswordContent(link: string, password: string): string {
    let mail = header('Redefina seu e-mail no Velho Texas');
    mail += `
    <body style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
            <tr>
                <td style="padding: 10px 0 30px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                        <tr>
                            <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="color: #000000; font-family: Arial, sans-serif; font-size: 24px;">
                                            <b>Você solicitou uma redefinição de senha!</b>
                                        </td>
                                    </tr>
                                    <tr><td><br></td></tr>
                                        `;
    if (!password) {
        mail += `                   <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                            No entanto, você ainda não possui uma senha. Mas não se preocupe. Você pode clicar no link abaixo para confirmar seu e-mail e definir uma senha.
                                        </td>
                                    </tr>`;
    } else {
        mail += `                   <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        <td>
                                            👇 Clique no link abaixo para redefinir sua senha.
                                        </td>
                                    </tr>`;
    }

    mail += `                       <tr><td><br></td></tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 20px; line-height: 20px;">
                                        <td>
                                            ⚠️ Mas fique atento ✋
                                            <br>
                                            <br>
                                            Para sua segurança, o Link enviado dura <b>APENAS 1 DIA</b>, portanto, não perca tempo e redefina sua senha agora mesmo, rapaiz!
                                        </td>
                                    </tr>
                                    <tr><td><br></td></tr>
                                    <tr style="padding: 20px 0 30px 0; color: #000000; font-family: Arial, sans-serif; font-size: 20px; line-height: 20px;">
                                        <td>
                                            <a href="${link}" style="color: #fff !important;text-transform:uppercase;text-decoration: none;background: #5a1f01;padding: 20px;border-radius: 5px;display: inline-block;border: none;">
                                                🔐 ${mail ? 'Redefinir sua' : 'Confirmar e-mail e Definir uma'} Senha
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>`
    mail += footer;

    return mail;
}
