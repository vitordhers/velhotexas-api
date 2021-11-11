import { IsNotEmpty, IsString, IsOptional, IsDefined, Length, MaxLength, IsNumber, Min, IsEmail } from 'class-validator';

export class offlineAddressDto {
    @IsDefined()
    @IsEmail()
    @Length(6, 30, { message: "O email deve ter entre $constraint1 e $constraint2 caracteres!" })
    public email?: string

    @IsDefined()
    @Length(4, 50, { message: "O nome deve ter entre $constraint1 e $constraint2 caracteres!" })
    public name?: string

    @IsDefined()
    @IsNotEmpty({ message: "CEP inválido" })
    @IsString({ message: "Valor do CEP inválido." })
    @Length(9, 9, { message: "O cep deve ter $constraint2 caracteres!" })
    public postalCode: string;

    @IsDefined()
    @IsNotEmpty({ message: "Inserir o endereço da rua é obrigatório" })
    @IsString({ message: "Valor do endereço da rua é inválido." })
    @MaxLength(50, { message: "O endereço da rua deve ter até $constraint1 caracteres!" })
    public street: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    public no: number;

    @IsDefined()
    @IsNotEmpty({ message: "Inserir a cidade do endereço é obrigatório" })
    @IsString({ message: "Valor da cidade do endereço é inválido." })
    @MaxLength(70, { message: "A cidade do endereço deve ter até $constraint1 caracteres!" })
    public city: string;

    @IsDefined()
    @IsNotEmpty({ message: "Inserir o estado do endereço é obrigatório" })
    @IsString({ message: "Valor do estado do endereço é inválido." })
    @MaxLength(2, { message: "O estado do endereço deve ter até $constraint1 caracteres!" })
    public state: string;

    @IsOptional()
    @IsString({ message: "Valor do complemento do endereço é inválido." })
    @MaxLength(80, { message: "O complemento do endereço deve ter até $constraint1 caracteres!" })
    public addInfo?: string;
}