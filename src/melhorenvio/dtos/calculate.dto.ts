import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import CartItem from "../../products/models/cartitem.model";

export class CalculateDto {
  @IsDefined({
    message: "Inserir a relação de produtos e quantidades é obrigatório!",
  })
  @IsNotEmpty({
    message: "Inserir a relação de produtos e quantidades é obrigatório!",
  })
  items: CartItem[];

  @IsDefined({ message: "Inserir o CEP é obrigatório!" })
  @IsNotEmpty({ message: "Inserir o CEP é obrigatório!" })
  @IsString({ message: "Valor do CEP inválido." })
  postalCode: string;
}
