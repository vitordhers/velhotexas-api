import { IsNotEmpty, IsString, IsNumber, IsIn, IsOptional } from 'class-validator';

export class FreightDto {
    @IsNotEmpty({ message: "CEP obrigatório." })
    @IsString({ message: "CEP inválido." })
    public postalCode: string;

    @IsNotEmpty({ message: "Valor obrigatório." })
    @IsNumber({}, { message: "Valor inválido." })
    public amount: number;

    @IsNotEmpty({ message: "Peso obrigatório" })
    @IsNumber({}, { message: "Valor inválido." })
    public weight: number;

    @IsOptional()
    @IsString({ message: "Forma de envio inválida." })
    @IsIn(['pac', 'sedex'], { message: "Forma de envio inválida." })
    public freightMode: 'pac' | 'sedex';
}