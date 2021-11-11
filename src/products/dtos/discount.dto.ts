import { IsDefined, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";

export class DiscountDto {
    @IsDefined({ message: "Inserir o ID do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID do produto é obrigatório!" })
    @IsString({ message: "Valor de ID inválido." })
    _id: string;

    @IsOptional()
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Valor do Preço inválido." })
    @IsPositive({ message: "Insira um Preço maior que zero." })
    price: number;

    @IsOptional()
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Valor do Desconto inválido." })
    @IsPositive({ message: "Insira um Desconto que zero." })
    @Min(1, { message: "O valor do desconto precisa ser maior que 1." })
    @Max(99, { message: "O valor do desconto precisa ser menor que 99." })
    onSale: number
}
