import {
  Injectable,
  HttpService,
  NotAcceptableException,
} from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
import * as envfile from 'envfile';
import { writeFileSync } from 'fs';
import { Observable, throwError } from 'rxjs';
import Payment from '../shared/models/payment.model';
import Charge from '../shared/models/charge.model';
import JunoError from './models/juno-error.model';

@Injectable()
export class JunoService {
  private _authorization =
    process.env.ENVIRONMENT === 'production'
      ? process.env.JUNO_AUTHORIZATION_TEST
      : process.env.JUNO_AUTHORIZATION_TEST;
  private _xResourceToken =
    process.env.ENVIRONMENT === 'production'
      ? process.env.JUNO_X_RESOURCE_TOKEN_PRODUCTION
      : process.env.JUNO_X_RESOURCE_TOKEN_TEST;
  private junoUrl =
    process.env.ENVIRONMENT === 'production'
      ? process.env.JUNO_URL_PRODUCTION
      : process.env.JUNO_URL_TEST;

  constructor(private http: HttpService) { }

  get xResourceToken(): string {
    return this._xResourceToken;
  }

  get authorization(): string {
    return this._authorization;
  }

  get accessToken(): string {
    return process.env.JUNO_ACCESS_TOKEN;
  }

  get expiryDate() {
    return parseInt(process.env.JUNO_ACCESS_TOKEN_EXPIRY);
  }

  set accessToken(accessToken: string) {
    process.env.JUNO_ACCESS_TOKEN = accessToken;
  }

  set expiryDate(timestamp: number) {
    process.env.JUNO_ACCESS_TOKEN_EXPIRY = String(
      Math.floor(Date.now() / 1000) + timestamp,
    );
  }

  setTokenAndExpiryDate(data: { access_token: string; expires_in: number }) {
    this.expiryDate = data.expires_in;
    this.accessToken = data.access_token;

    const sourcePath = '.env';
    let parsedFile: any = envfile.parseFileSync(sourcePath);
    parsedFile.JUNO_ACCESS_TOKEN = `Bearer ${data.access_token}`;
    parsedFile.JUNO_ACCESS_TOKEN_EXPIRY = String(
      Math.floor(Date.now() / 1000) + data.expires_in,
    );
    writeFileSync('./.env', envfile.stringifySync(parsedFile));
  }

  checkExpiryDate() {
    return !this.expiryDate || Math.floor(Date.now() / 1000) >= this.expiryDate;
  }

  async renewAccessToken() {
    try {
      const result = await this.http
        .post<{ access_token: string; expires_in: number }>(
          `${this.junoUrl}authorization-server/oauth/token`,
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: this.authorization,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(map((res) => res.data))
        .toPromise();

      if (result) {
        this.setTokenAndExpiryDate(result);
      }
    } catch (e) {
      console.log('RENEW ACCESS TOKEN CATCH BLOCK', e);
    }
  }

  cancelCharge(chargeId: string) {
    return this.http
      .put(
        `${this.junoUrl}api-integration/charges/${chargeId}/cancelation`,
        null,
        {
          headers: {
            Authorization: this.accessToken,
            'X-Api-Version': 2,
            'X-Resource-Token': this.xResourceToken,
            'Content-Type': 'application/json',
          },
        },
      )
      .toPromise();
  }

  refundCreditCardCharge(chargeId: string) {
    return this.http
      .post<{
        transactionId: string;
        instalments: number;
        payments: any;
        _links: any;
      }>(
        `${this.junoUrl}api-integration/payments/${chargeId}/capture`,
        {
          chargeId,
        },
        {
          headers: {
            Authorization: this.accessToken,
            'X-Api-Version': 2,
            'X-Resource-Token': this.xResourceToken,
            'Content-Type': 'application/json',
          },
        },
      )
      .toPromise();
  }

  async createCharge(
    amount: number,
    name: string,
    document: string,
    email: string = '',
    description: string,
    installments = 1,
    discountAmount = 0,
  ) {
    let date = new Date();
    date.setDate(date.getDate() + 3);
    const dueDate = date.toISOString().split('T')[0];
    let notify = false;

    const charge = {
      charge: {
        description,
        references: [],
        amount: Math.round(amount * 100) / 100,
        dueDate,
        installments,
        maxOverdueDays: 0,
        fine: 0,
        interest: 0,
        discountAmount,
        discountDays: -1,
        paymentTypes: ['BOLETO', 'CREDIT_CARD'],
      },
      billing: {
        name,
        document,
        email,
        notify,
      },
    };

    return await this.http
      .post<{
        _embedded: {
          charges: Charge[];
        };
      }>(`${this.junoUrl}api-integration/charges`, charge, {
        headers: {
          Authorization: this.accessToken,
          'X-Api-Version': 2,
          'X-Resource-Token': this.xResourceToken,
          'Content-Type': 'application/json',
        },
      })
      .pipe(map((result) => result.data._embedded.charges[0]))
      .toPromise();
  }

  createCreditCardPayment(
    chargeId: string,
    email: string,
    street: string,
    postCode: string,
    number: string,
    city: string,
    state: string,
    creditCardHash: string,
    complement?: string,
  ): Observable<{
    success: boolean;
    payment: Payment;
  }> {
    const payment = {
      chargeId,
      billing: {
        email,
        address: {
          street,
          number,
          complement,
          neighborhood: '',
          city,
          state,
          postCode: postCode.replace(/\D/g, ''),
        },
      },
      creditCardDetails: {
        creditCardHash,
      },
    };

    return this.http
      .post<Payment>(`${this.junoUrl}api-integration/payments`, payment, {
        headers: {
          Authorization: this.accessToken,
          'X-Api-Version': 2,
          'X-Resource-Token': this.xResourceToken,
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        catchError((error: { response: { data: JunoError } }) => {
          // LOGGER
          console.log('PAYMENT ERRORRRRR', error.response.data.details);
          // { message: 'Não autorizado. Saldo insuficiente.', errorCode: '289999' }
          // { message: 'Não autorizado. Cartão restrito.', errorCode: '289999' }
          // { message: 'Não autorizado. Cartão inválido.', errorCode: '289999' }
          // { message: 'Não foi possível realizar a operação, por favor, tente novamente mais tarde', errorCode: '373014'  }
          return throwError(error.response.data.details[0].message);
        }),
        map((result) => result.data),
        map((result) => {
          if (result.payments[0].status === 'CONFIRMED') {
            return { success: true, payment: result };
          } else {
            throw new NotAcceptableException();
          }
        }),
      );
  }

  createBankSlipPayment(OrderId: string) { }
}
