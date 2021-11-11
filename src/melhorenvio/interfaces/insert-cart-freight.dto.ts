export default class insertCartFreightDto {
  constructor(
    public service: number,
    public from: {
      name: 'Vitor Hugo Medeiros Dhers';
      phone: '19991556016';
      email: 'dina@velho-texas.com';
      document: '40402256867';
      company_document: '';
      state_register: null;
      address: 'Av. Dois Corregos';
      complement: 'apt. 204';
      number: '1861';
      district: 'Dois Crregos';
      city: 'Piracicaba';
      country_id: 'BR';
      postal_code: '13420835';
      note: string;
    },
    public to: {
      name: string;
      phone: string | '000000000000';
      email: string;
      document: string;
      company_document: string;
      state_register: null;
      address: string;
      complement: string;
      number: string;
      district: null;
      city: string;
      state_abbr: string;
      country_id: 'BR';
      postal_code: string;
      note: string;
    },
    public products: {
      name: string;
      quantity: number;
      unitary_value: number;
    }[],
    public volumes: {
      height: number;
      width: number;
      length: number;
      weight: number;
    }[],
    public options: {
      insurance_value: number;
      receipt: boolean;
      own_hand: boolean;
      reverse: boolean;
      non_commercial: boolean;
      invoice: {
        key: string;
      };
      platform: 'Velho Texas';
      tags: [
        {
          tag: string;
          url: string;
        },
      ];
    },
    public agency?: 21,
  ) { }
}
