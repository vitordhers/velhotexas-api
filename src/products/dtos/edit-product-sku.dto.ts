import { IsNotEmpty, IsString, IsNumber, IsPositive, IsDefined } from 'class-validator';

export class EditProductSkuDto {

    @IsDefined({ message: "Inserir o ID do produto é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID do produto é obrigatório!" })
    @IsString({ message: "Valor de ID inválido." })
    _id: string;

    @IsDefined({ message: "Inserir a quantidade do acréscimo é obrigatório!" })
    @IsNotEmpty({ message: "Inserir a quantidade do acréscimo é obrigatório!" })
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
        { message: "Valor da quantidade do acréscimo inválido." })
    @IsPositive({ message: "Insira uma quantidade do acréscimo maior que zero." })
    quantity: number;

}
