import { Injectable, Inject } from "@nestjs/common";
import { createTransport } from "nodemailer";
import { confirmEmail } from "./templates/confirm-email.template";
import { newOrderContent } from "./templates/new-order-email-template";
import { Order } from "../orders/models/order.model";
import { OrderStatus } from "../orders/enums/order-status.enum";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { TokensService } from "../auth/tokens.service";
import { UserStatus } from "../shared/enums/user-status.enum";
import { forgotPasswordContent } from "./templates/forgot-email.template";

@Injectable()
export class EmailService {
    private transporter;
    constructor(
        private tokensService: TokensService
    ) {
        this.transporter = createTransport({
            host: 'smtpout.secureserver.net',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_ACCOUNT,
                pass: process.env.MAIL_PASS
            }
        });
    }

    public async sendConfirmationEmail(email: string, resend: boolean): Promise<boolean> {
        const confirmationToken = await this.tokensService.createEmailConfirmationToken(email, 'confirm');
        let link = `${process.env.APP_URL}confirmar?token=${confirmationToken}`;

        const html = confirmEmail(link, resend);

        let info = await this.transporter.sendMail({
            from: '"O Velho Texas 🌵🐴🤠" <dina@velho-texas.com>',
            to: email,
            subject: "Confirme seu e-mail, Roy!",
            html
        });

        if (info.accepted.length === 1) {
            return true;
        } else {
            return false;
        }
    }

    public async newOrderEmail(id: string, email: string, orderById: boolean, order: Order, password: boolean) {
        let link: string;
        if (orderById) {
            const payload: JwtPayload = {
                id,
                role: 'user',
                access: 'low'
            };
            const accessToken = await this.tokensService.createAccessToken(payload);
            link = `${process.env.APP_URL}/pedido?pedido=${order.orderId}&token=${accessToken}`;
        } else {
            link = `${process.env.APP_URL}/pedidos?pedido=${order.orderNo}`;
        }
        const html = newOrderContent(link, order, password);

        let info = await this.transporter.sendMail({
            from: '"O Velho Texas 🌵🐴🤠" <dina@velho-texas.com>',
            to: email,
            subject: `Confirmação ${order.status === OrderStatus.PENDING_DELIVERY ? 'pagamento do' : 'do'} seu Pedido #${order.orderNo} no Velho Texas.`,
            html
        });

        if (info.accepted.length === 1) {
            return true;
        } else {
            return false;
        }
    }

    public async forgotPasswordEmail(email: string, password: string, userStatus: UserStatus) {
        const confirmationToken = await this.tokensService.createEmailConfirmationToken(email, 'redefine');
        let link;
        if (userStatus === UserStatus.REGISTERED_AND_CONFIRMED) {
            link = `${process.env.APP_URL}redefinirsenha?token=${confirmationToken}`;
        } else {
            link = `${process.env.APP_URL}confirmar?token=${confirmationToken}`;
        }


        const html = forgotPasswordContent(link, password);

        let info = await this.transporter.sendMail({
            from: '"O Velho Texas 🌵🐴🤠" <dina@velho-texas.com>',
            to: email,
            subject: "Redefina sua senha, Roy!",
            html
        });

        if (info.accepted.length === 1) {
            return true;
        } else {
            return false;
        }
    }

    // async testEmail() {
    //     const transporter = createTransport({
    //         host: 'smtpout.secureserver.net',
    //         port: 465,
    //         secure: true,
    //         auth: {
    //             user: process.env.MAIL_ACCOUNT,
    //             pass: process.env.MAIL_PASS
    //         }
    //     });

    //     let info = await transporter.sendMail({
    //         from: '"O Velho Texas 🌵🐴🤠" <dina@velho-texas.com>',
    //         to: 'vitor.dhers@gmail.com',
    //         subject: "TESTE",
    //         text: 'Hello, World!'
    //     });

    //     console.log(info);
    // }

}