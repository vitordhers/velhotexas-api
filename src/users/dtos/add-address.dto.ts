import { IsNotEmpty, IsString, Length, MaxLength, IsNumber, Min, IsOptional } from 'class-validator';

export class addAddressDto {
    @IsNotEmpty({ message: "Usuário inválido" })
    @IsString({ message: "Valor de usuário inválido." })
    @Length(9, 9, { message: "O cep deve ter $constraint2 caracteres!" })
    public postalCode: string;

    @IsNotEmpty({ message: "Inserir o endereço da rua é obrigatório" })
    @IsString({ message: "Valor do endereço da rua é inválido." })
    @MaxLength(50, { message: "O endereço da rua deve ter até $constraint1 caracteres!" })
    public street: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    public no: number;

    @IsNotEmpty({ message: "Inserir a cidade do endereço é obrigatório" })
    @IsString({ message: "Valor da cidade do endereço é inválido." })
    @MaxLength(70, { message: "A cidade do endereço deve ter até $constraint1 caracteres!" })
    public city: string;

    @IsNotEmpty({ message: "Inserir o estado do endereço é obrigatório" })
    @IsString({ message: "Valor do estado do endereço é inválido." })
    @MaxLength(2, { message: "O estado do endereço deve ter até $constraint1 caracteres!" })
    public state: string;

    @IsOptional()
    @IsString({ message: "Valor do complemento do endereço é inválido." })
    @MaxLength(80, { message: "O complemento do endereço deve ter até $constraint1 caracteres!" })
    public addInfo?: string;

    @IsOptional()
    @IsString({ message: "Id do endereço inválido" })
    public addressId?: string;
}