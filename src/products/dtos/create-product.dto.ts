import { IsNotEmpty, IsString, IsOptional, IsNumber, IsPositive, IsDefined, Min, Max } from 'class-validator';

export class CreateProductDto {

    @IsDefined({ message: "Inserir o ID do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID do produto é obrigatório!" })
    @IsString({ message: "Valor de ID inválido." })
    _id: string;

    @IsDefined({ message: "Inserir a categoria do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir a categoria do produto é obrigatório!" })
    @IsString({ message: "Valor de categoria inválido." })
    category_id: string;

    @IsDefined({ message: "Inserir o nome do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o nome do produto é obrigatório!" })
    @IsString({ message: "Valor de nome do produto inválido." })
    title: string;

    @IsDefined({ message: "Inserir as unidades do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir as unidades do produto é obrigatório!" })
    @IsString({ each: true, message: "Valor das unidades do produto são inválidos." })
    unit: [string, string];

    @IsDefined({ message: "Inserir Peso Bruto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir Peso Bruto é obrigatório!" })
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Valor do Peso Bruto inválido." })
    @IsPositive({ message: "Insira um Peso Bruto maior que zero." })
    shippingWeight: number;

    @IsDefined({ message: "Inserir Peso Neto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir Peso Neto é obrigatório!" })
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Valor do Peso Neto inválido." })
    @IsPositive({ message: "Insira um Peso Neto maior que zero." })
    netWeight: number;

    @IsDefined({ message: "Inserir Preço é obrigatório!" })
    @IsNotEmpty({ message: "Inserir Preço é obrigatório!" })
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Valor do Preço inválido." })
    @IsPositive({ message: "Insira um Preço maior que zero." })
    price: number;

    @IsOptional()
    @IsString({ each: true, message: "Valor das skus são inválidos." })
    skus?: string[];

    @IsDefined({ message: "Inserir a Marca do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir a Marca do produto é obrigatório!" })
    @IsString({ each: true, message: "Valor da Marca do produto é inválido." })
    brand: string;

    @IsDefined({ message: "Inserir as Tags do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir as Tags do produto é obrigatório!" })
    @IsString({ each: true, message: "Valor das Tags do produto são inválido." })
    tags: string[];

    @IsDefined({ message: "Inserir a Descrição do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir a Descrição do produto é obrigatório!" })
    @IsString({ message: "Valor da Descrição do produto é inválido." })
    description: string;

    @IsDefined({ message: "Inserir as dimensões do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir as dimensões do produto é obrigatório!" })
    @IsString({ each: true, message: "Valor das dimensões do produto são inválidos. Use array de números [largura, tamanho, comprimento]." })
    whlSize: [number, number, number];

    @IsOptional()
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Valor do Desconto inválido." })
    @IsPositive({ message: "Insira um Desconto que zero." })
    @Min(1, { message: "O valor do desconto precisa ser maior que 1." })
    @Max(99, { message: "O valor do desconto precisa ser menor que 99." })
    onSale: number

}
