import { IsNotEmpty, IsString, IsDefined, IsDate, Length, IsDateString } from 'class-validator';

export class UpdateDeliveryDto {
    @IsDefined({ message: "Inserir o ID do usuário é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID do usuário é obrigatório!" })
    @IsString({ message: "ID do usuário inválido." })
    userId: string;

    @IsDefined({ message: "Inserir o ID do pedido é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID do pedido é obrigatório!" })
    @IsString({ message: "ID do pedido inválido." })
    orderId: string;

    @IsDefined({ message: "Inserir a data da entrega é obrigatório!" })
    @IsNotEmpty({ message: "Inserir a data da entrega é obrigatório!" })
    @IsDateString({ message: "Data de postagem inválida." })
    date: Date;

}
