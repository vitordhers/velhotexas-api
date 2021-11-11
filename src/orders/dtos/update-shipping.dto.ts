import { IsNotEmpty, IsString, IsDefined, Length, IsDateString, ValidateIf, IsIn } from 'class-validator';

export class UpdateShippingDto {
    @IsDefined({ message: "Definir o modo é obrigatório!" })
    @IsNotEmpty({ message: "Definir o modo é obrigatório!" })
    @IsString({ message: "Modo inválido." })
    @IsIn(['shipping', 'delivery'], { message: "O modo deve ser 'shipping' ou 'delivery'" })
    mode: string;

    @IsDefined({ message: "Inserir o ID do usuário é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID do usuário é obrigatório!" })
    @IsString({ message: "ID do usuário inválido." })
    userId: string;

    @IsDefined({ message: "Inserir o ID do pedido é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID do pedido é obrigatório!" })
    @IsString({ message: "ID do pedido inválido." })
    orderId: string;

    @IsDefined({ message: "Inserir a data da postagem é obrigatório!" })
    @IsNotEmpty({ message: "Inserir a data da postagem é obrigatório!" })
    @IsDateString({ message: "Data de postagem inválida." })
    date: Date;

    @ValidateIf(o => o.delivery === false)
    @IsDefined({ message: "Inserir o código de rastreio é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o código de rastreio é obrigatório!" })
    @Length(13, 13, { message: "O código de rastreio deve ter 13 caracteres!" })
    mailTrackingCode: string;
}
