import { Injectable, HttpService, ConflictException } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { InjectModel } from "nestjs-typegoose";
import { map } from "rxjs/operators";
import InsertCartResponse from "../orders/interfaces/insert-cart-response.interface";
import CartItem from "../products/models/cartitem.model";
import { Address } from "../users/models/address.model";
import { Product } from "../products/models/product.model";
import { CalculateDto } from "./dtos/calculate.dto";
import CalculateReponse from "./interfaces/calculate.interface";
import insertCartFreightDto from "./interfaces/insert-cart-freight.dto";
import OauthTokenResponse from "./interfaces/oauth-token.interface";
import CheckoutReponse from "src/orders/interfaces/checkout-reponse.interface";

@Injectable()
export class MelhorEnvioService {
  private url = "https://sandbox.melhorenvio.com.br";
  private clientId = "946";
  private secret = "RZz4IkzhaAHzDWvyqkQw6DqSqxkav8LDg8JFApX0";
  private redirect_uri = `${process.env.API_URL}freight/tokens`;
  public melhorEnvioUrl: string;

  private _accessToken: string;
  private _refreshToken: string;
  private _expiryDate: number;

  constructor(
    private http: HttpService,
    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>
  ) {}

  get accessToken(): string {
    // return this._accessToken;
    return `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjNhNGJlM2IwODYzYjljZjM3ZWQ4OWQ0NmNmZTU1MTQxYjk3ZjBhN2VkMmIwOGVjZDA1Y2JmMTIwOGE5ZjA0M2I1MDAyYzBmNGFmNzllZjUwIn0.eyJhdWQiOiI5NTYiLCJqdGkiOiIzYTRiZTNiMDg2M2I5Y2YzN2VkODlkNDZjZmU1NTE0MWI5N2YwYTdlZDJiMDhlY2QwNWNiZjEyMDhhOWYwNDNiNTAwMmMwZjRhZjc5ZWY1MCIsImlhdCI6MTYxMTc5NDEyMCwibmJmIjoxNjExNzk0MTIwLCJleHAiOjE2NDMzMzAxMjAsInN1YiI6Ijk4YTMxOTdjLTZlMGMtNGEyOC1iNWI4LTdlMmJlOTIzOWJjYSIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtZGVzdHJveSIsInByb2R1Y3RzLXdyaXRlIiwicHVyY2hhc2VzLXJlYWQiLCJzaGlwcGluZy1jYWxjdWxhdGUiLCJzaGlwcGluZy1jYW5jZWwiLCJzaGlwcGluZy1jaGVja291dCIsInNoaXBwaW5nLWNvbXBhbmllcyIsInNoaXBwaW5nLWdlbmVyYXRlIiwic2hpcHBpbmctcHJldmlldyIsInNoaXBwaW5nLXByaW50Iiwic2hpcHBpbmctc2hhcmUiLCJzaGlwcGluZy10cmFja2luZyIsImVjb21tZXJjZS1zaGlwcGluZyIsInRyYW5zYWN0aW9ucy1yZWFkIiwidXNlcnMtcmVhZCIsInVzZXJzLXdyaXRlIiwid2ViaG9va3MtcmVhZCIsIndlYmhvb2tzLXdyaXRlIl19.bm1Sj9oufi34BVcGb0sJVVM27hhca05G8pWSKeKA3eTPqgO2ge8W_Fuw4pq5c6xf2ejrGKtpBgfSo0OzYJYp1L1xoO_dB7ImNsPiRXYczYIny0RVDEfFzVE4S4SQl6sK-j751avmSmMkWo3aSc4qXv9qm0CzsPK34DdoCU43yMfO6ryEIB7ynWZbD5ZVkop66b3BSrElIuEiDnz0go-NCBU8scQaTNi_ldBdhyce-_wURvFVPmf2TcyHv0Yxhb7CanCyixOG-Og3SfsnmqeWOCo97XJwukeQ-jPheBwO-u8be3kSHhSMALqbqKlyv9TcnydFYvEktqwzkTq13vgRV3rAq3rU2zZAoNPyCzXCEHafgapUne4TjBz_8siXpukygAM_lohxUuT0i9MSpIAsAb4tZbvRlOLkgF7Lykef9Y3tsEKKySGGzKKfJrSTnKugF4bcNo2agyzxf304tUKasrvn1w54_OnNtpyPCepta7qaF7j9V4A9mrRTa2Jd61cxmJPWTl50Wi2iwNIwWT5uvxcw9I618mrKv_byGUnnlYR79PHSb0G7MpFQ7sP9k8RoMjaaFKfUgYFwNcUX1f2E-HLOmfQ9OoVn99lpc5qGPlmjM8BjKaR06typOx6Od2ZIV77sELB2yPMs9Tjl24HW8pggacsCI6eAvvFs3Y_TfAQ`;
  }

  set accessToken(token: string) {
    this._accessToken = `Bearer ${token}`;
  }

  get refreshToken(): string {
    // return this._refreshToken;
    return `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijg4NzI0N2I5N2FkNTg2NmFjOTRiNzdmNDllNDNkNjc4Y2I5MmQwNmQwYzY0NjI5NTEyYmZhOGYzMGRhMTg5NTdhNDAxMTljNjEyZjk2YzlhIn0.eyJhdWQiOiI5NDYiLCJqdGkiOiI4ODcyNDdiOTdhZDU4NjZhYzk0Yjc3ZjQ5ZTQzZDY3OGNiOTJkMDZkMGM2NDYyOTUxMmJmYThmMzBkYTE4OTU3YTQwMTE5YzYxMmY5NmM5YSIsImlhdCI6MTYwOTg3MTgzNiwibmJmIjoxNjA5ODcxODM2LCJleHAiOjE2MTI0NjM4MzYsInN1YiI6Ijk4YTMxOTdjLTZlMGMtNGEyOC1iNWI4LTdlMmJlOTIzOWJjYSIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtd3JpdGUiLCJwdXJjaGFzZXMtcmVhZCIsInNoaXBwaW5nLWNhbGN1bGF0ZSIsInNoaXBwaW5nLWNhbmNlbCIsInNoaXBwaW5nLWNoZWNrb3V0Iiwic2hpcHBpbmctY29tcGFuaWVzIiwic2hpcHBpbmctZ2VuZXJhdGUiLCJzaGlwcGluZy1wcmV2aWV3Iiwic2hpcHBpbmctcHJpbnQiLCJzaGlwcGluZy1zaGFyZSIsInNoaXBwaW5nLXRyYWNraW5nIiwiZWNvbW1lcmNlLXNoaXBwaW5nIiwidHJhbnNhY3Rpb25zLXJlYWQiLCJ1c2Vycy1yZWFkIiwidXNlcnMtd3JpdGUiXX0.nXbzcAaGyu_kVVzC_3s95Jc2tjwMlrI1qDJWxUEROHrYiJg5xB3EHFDtuqLTlXqHRAaIdMGfQMCwG9T8pi5CNTgfdm2tqW4mz2VG9HRO4uHEwlUAtiiWd7kQRG3E9OYQHaZuQOG3LbOvxw3RrP7w77YFCxpeFGtUXSbM-gTC7NMrZJPq2TF9eO4Zb1Inr4nxItjY_HfzcSPRKyycSCYBZxv4fIYZRfSMXR30Lg35y6n2XomYNoJcOVm29qmNt0dWa6hag_QX82IOxNtK5wA_HBdrGzkO3nzC2pB28kupCe7ETEEbzc2t02zPOlKcQAsn6411m6LXckZdeRNMRRL-UfY9y-mgo15guYzO1o_HoNXHlqHWkhOyFxp_TujkRv0MPCtBBwzPCMUy3WydTxO3isFBilVLq9AsITnY65FeNzigEX1z5KR4GGZI4hmItgV5-OG9pPoSJdqGcEx72s5c-q8Zd2rMZqQ-ax0v59HUxPrUua0u-iz6eo0GJykiOvAzHnFNVBjXJQ3uTff51jwfT8mRdDJbWhDXXbnbdXMPP5cy6L-RS3u7Mc1yirlCMQmiMb5QeTu_Fl2ZetPdTHZX7EEBlmI3l6Pf6jUXqlrmL-AB9-sXolwdsWvBOdrA4l6l40M1TvoDyHmjobqWgWUfoFxn779U46givRAMeeBdwcM`;
  }

  set refreshToken(token: string) {
    this._refreshToken = token;
  }

  get expiryDate() {
    return this._expiryDate;
  }

  set expiryDate(timestamp: number) {
    this._expiryDate = Date.now() / 1000 + timestamp;
  }

  setTokensAndExpiryDate(data: {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
  }) {
    if (data.access_token) {
      this.accessToken = data.access_token;
    }
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
    if (data.expires_in) {
      this.expiryDate = data.expires_in;
    }
  }

  checkExpiryDate() {
    if (!this.expiryDate || this.expiryDate <= Date.now() / 1000) {
      this.getAccessToken();
    }
  }

  authorize(): string {
    return `${this.url}/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirect_uri}&response_type=code&state=teste&scope=cart-read cart-write companies-read companies-write coupons-read coupons-write notifications-read orders-read products-read products-write purchases-read shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping transactions-read users-read users-write`;
  }

  getTokens(code: string): void {
    const data = {
      grant_type: "authorization_code",
      client_id: this.clientId,
      client_secret: this.secret,
      redirect_uri: this.redirect_uri,
      code: code,
    };

    this.http
      .post<OauthTokenResponse>(`${this.url}/oauth/token`, data)
      .pipe(map((res) => res.data))
      .subscribe((data) => {
        this.setTokensAndExpiryDate(data);
      });
  }

  getAccessToken() {
    const data = {
      grant_type: "refresh_token",
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.secret,
    };
    this.http
      .post<OauthTokenResponse>(`${this.url}/oauth/token`, data)
      .pipe(map((res) => res.data))
      .subscribe((data) => {
        this.setTokensAndExpiryDate(data);
      });
  }

  listInfo() {
    return this.http
      .get<any>(`${this.url}/api/v2/me/shipment/app-settings`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: this.accessToken,
          "User-Agent": "velho-texas vitor.dhers@gmail.com",
        },
      })
      .pipe(map((res) => res.data))
      .toPromise();
  }

  async calculate(calculateDto: CalculateDto): Promise<CalculateReponse[]> {
    console.log("CALCULATE");
    const { items, postalCode } = calculateDto;
    let insurance_value = 0;
    let totalWeight = 0;

    if (items[0].price && items[0].shippingWeight) {
      calculateDto.items.forEach((item) => {
        insurance_value = insurance_value + item.quantity * item.price;
        totalWeight =
          totalWeight + (item.quantity * item.shippingWeight) / 1000;
      });
    } else {
      let itemsIds = [];

      items.forEach((item) => {
        itemsIds.push(item.id);
      });

      const fetchedProducts = await this.productModel
        .find(
          { _id: { $in: itemsIds } },
          { skus: 1, price: 1, shippingWeight: 1 }
        )
        .exec();

      fetchedProducts.forEach((fetchedProduct) => {
        const item = items.find((item) => item.id === fetchedProduct._id);
        if (item) {
          insurance_value = insurance_value + item.quantity * item.price;
          totalWeight =
            totalWeight + (item.quantity * item.shippingWeight) / 1000;
        } else {
          throw new ConflictException();
        }
      });
    }

    const data = {
      from: {
        postal_code: "13420835",
      },
      to: {
        postal_code: postalCode,
      },
      // products,
      package: {
        height: 10,
        width: 11,
        length: 16,
        weight: totalWeight,
      },
      options: {
        insurance_value,
        receipt: false,
        own_hand: false,
      },
      services: "1,2",
    };

    return this.http
      .post<CalculateReponse[]>(
        `${this.url}/api/v2/me/shipment/calculate`,
        data,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: this.accessToken,
            "User-Agent": "velho-texas vitor.dhers@gmail.com",
          },
        }
      )
      .pipe(map((res) => res.data))
      .toPromise();
  }

  async insertCartFreight(
    user: {
      userId: Types.ObjectId;
      name: string;
      email: string;
      phone: string;
      document: string;
      address: Address;
    },
    orderId: Types.ObjectId,
    orderNo: number,
    cartItems: CartItem[],
    freightMode: number
  ) {
    if (freightMode === 1 || freightMode === 2) {
      // CORREIOS

      let products: {
        name: string;
        quantity: number;
        unitary_value: number;
      }[] = [];

      let weight = 0;
      let insurance_value = 0;

      for (const product of cartItems) {
        weight = weight + product.shippingWeight / 1000;
        insurance_value = insurance_value + product.price;
        products.push({
          name: product.title,
          quantity: product.quantity,
          unitary_value: product.price,
        });
      }

      const data = new insertCartFreightDto(
        freightMode,
        {
          name: "Vitor Hugo Medeiros Dhers",
          phone: "19991556016",
          email: "dina@velho-texas.com",
          document: "40402256867",
          company_document: null,
          state_register: null,
          address: "Av. Dois Corregos",
          complement: "apt. 204",
          number: "1861",
          district: "Dois Crregos",
          city: "Piracicaba",
          country_id: "BR",
          postal_code: "13420835",
          note: "",
        },
        {
          name: user.name,
          phone: user.phone || "000000000000",
          email: user.email,
          document: user.document,
          company_document: null,
          state_register: null,
          address: user.address.street,
          complement: user.address.addInfo,
          number: String(user.address.no),
          district: null,
          city: user.address.city,
          state_abbr: user.address.state,
          country_id: "BR",
          postal_code: user.address.postalCode,
          note: "",
        },
        [...products],
        [
          {
            height: 10,
            width: 11,
            length: 16,
            weight,
          },
        ],
        {
          insurance_value,
          invoice: {
            key: "",
          },
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: true,
          platform: "Velho Texas",
          tags: [
            {
              tag: `${user.userId}_${orderId}`,
              url: `${process.env.APP_URL}usuario/pedidos?pedido=${orderNo}`,
            },
          ],
        }
      );

      try {
        return await this.http
          .post<InsertCartResponse[]>(`${this.url}/api/v2/me/cart`, data, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: this.accessToken,
              "User-Agent": "velho-texas vitor.dhers@gmail.com",
            },
          })
          .pipe(map((res) => res.data))
          .toPromise();
      } catch (e) {
        console.log("melhorEnvioCartError", e);
      }

    } else if (freightMode === 3 || freightMode === 4) {
      // JADLOG
      // let products: {
      //   name: string;
      //   quantity: number;
      //   unitary_value: number;
      // }[] = [];
      // let volumes: {
      //   height: number;
      //   width: number;
      //   length: number;
      //   weight: number;
      // }[];
      // cartItems.forEach((cartItem) => {
      //   products.push({
      //     name: cartItem.title,
      //     quantity: cartItem.quantity,
      //     unitary_value: cartItem.price,
      //   });
      //   volumes.push({
      //     width: cartItem.whlSize[0],
      //     height: cartItem.whlSize[1],
      //     length: cartItem.whlSize[2],
      //     weight: cartItem.shippingWeight / 1000,
      //   });
      // });
      // const data = new insertCartFreightDto(
      //   freightMode,
      //   {
      //     name: "Vitor Hugo Medeiros Dhers",
      //     phone: "19991556016",
      //     email: "dina@velho-texas.com",
      //     document: "40402256867",
      //     company_document: null,
      //     state_register: null,
      //     address: "Av. Dois Corregos",
      //     complement: "apt. 204",
      //     number: "1861",
      //     district: "Dois Crregos",
      //     city: "Piracicaba",
      //     country_id: "BR",
      //     postal_code: "13420835",
      //     note: "",
      //   },
      //   {
      //     name: user.name,
      //     phone: user.phone || "000000000000",
      //     email: user.email,
      //     document: user.document,
      //     company_document: null,
      //     state_register: null,
      //     address: user.address.street,
      //     complement: user.address.addInfo,
      //     number: String(user.address.no),
      //     district: null,
      //     city: user.address.city,
      //     state_abbr: user.address.state,
      //     country_id: "BR",
      //     postal_code: user.address.postalCode,
      //     note: "",
      //   },
      //   products,
      //   volumes,
      //   {
      //     insurance_value: totalAmount,
      //     invoice: {
      //       key: "",
      //     },
      //     receipt: false,
      //     own_hand: false,
      //     reverse: false,
      //     non_commercial: true,
      //     platform: "Velho Texas",
      //     tags: [
      //       {
      //         tag: `${user.userId}_${orderId}`,
      //         url: null,
      //       },
      //     ],
      //   },
      //   21
      // );
      // return await this.http
      //   .post<InsertCartResponse[]>(`${this.url}/api/v2/me/cart`, data, {
      //     headers: {
      //       Accept: "application/json",
      //       "Content-Type": "application/json",
      //       Authorization: this.accessToken,
      //       "User-Agent": "velho-texas vitor.dhers@gmail.com",
      //     },
      //   })
      //   .pipe(map((res) => res.data))
      //   .toPromise();
    }
  }

  checkout(labelIds: string[]) {
    let data = { orders: [] };

    labelIds.forEach((label) => {
      data.orders.push(label);
    });

    return this.http
      .post<CheckoutReponse>(
        `${this.url}/api/v2/me/shipment/checkout`,
        { ...data },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: this.accessToken,
            "User-Agent": "velho-texas vitor.dhers@gmail.com",
          },
        }
      )
      .pipe(map((res) => res.data))
      .toPromise();
  }

  generate(labelIds: string[]) {
    let data = { orders: [] };

    labelIds.forEach((label) => {
      data.orders.push(label);
    });

    return this.http
      .post<any>(
        `${this.url}/api/v2/me/shipment/generate`,
        { ...data },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: this.accessToken,
            "User-Agent": "velho-texas vitor.dhers@gmail.com",
          },
        }
      )
      .pipe(map((res) => res.data))
      .toPromise();
  }
}
