import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDefined,
  IsArray,
  IsIn,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import CartItem from '../../products/models/cartitem.model';
import { IsCpfValid } from '../decorators/cpf-validator.decorator';
import { Type } from 'class-transformer';
import { offlineAddressDto } from './offline-address.dto';

export class PlaceOrderDto {
  @IsDefined({ message: 'Inserir os produtos é obrigatório!' })
  @IsNotEmpty({ message: 'Inserir os produtos é obrigatório!' })
  @IsArray({ message: 'Valor de produtos inválido.' })
  products: CartItem[];

  @IsOptional()
  @IsString({ message: 'Id do endereço inválido.' })
  addressId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => offlineAddressDto)
  offlineAddress: offlineAddressDto;

  @IsDefined({ message: 'Inserir as unidades do produto é obrigatório!' })
  @IsNotEmpty({ message: 'Inserir as unidades do produto é obrigatório!' })
  @IsString({ message: 'Método de pagamento inválido.' })
  @IsIn(['boleto', 'paypal', 'creditCard'], {
    message: 'Método de pagamento inválido.',
  })
  paymentMethod: 'boleto' | 'creditCard';

  @IsDefined({ message: 'Inserir o CPF é obrigatório!' })
  @IsNotEmpty({ message: 'Inserir o CPF é obrigatório!' })
  @IsString({ message: 'Valor do CPF é inválido.' })
  @IsCpfValid({ message: 'Valor do CPF é inválido.' })
  cpf: string;

  @IsNotEmpty({ message: 'Forma de envio obrigatória.' })
  @IsNumber(
    { allowInfinity: false },
    { message: 'Forma de envio obrigatória.' },
  )
  @IsIn([1, 2, 3, 4], { message: 'Forma de envio inválida.' })
  freightMode: number;

  @IsOptional()
  cardHash?: string;
}
