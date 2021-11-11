import { IsNotEmpty, IsString, IsDefined } from 'class-validator';

export class CreateCategoryDto {

    @IsDefined({ message: "Inserir o ID da categoria é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o ID da categoria é obrigatório!" })
    @IsString({ message: "Valor de ID inválido." })
    _id: string;

    @IsDefined({ message: "Inserir o nome da categoria é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o nome da categoria é obrigatório!" })
    @IsString({ message: "Valor de nome da categoria inválido." })
    categoryName: string;

    @IsDefined({ message: "Inserir as tags da categoria é obrigatório!" })
    @IsNotEmpty({ message: "Inserir as tags da categoria é obrigatório!" })
    tags: { [key: string]: number };

}
