import { IsDefined, IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

export class GetProductsDto {
    @IsDefined({ message: "Inserir o limite é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o limite é obrigatório!" })
    @IsString({ message: "Valor do limite inválido." })
    limit: string;

    @IsDefined({ message: "Inserir o início é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o início é obrigatório!" })
    @IsString({ message: "Valor do início inválido." })
    skip: string;

    @IsDefined({ message: "Inserir a organização é obrigatório!" })
    @IsNotEmpty({ message: "Inserir a organização é obrigatório!" })
    @IsString({ message: "Valor da organização inválido." })
    @IsIn(['relevance', 'smaller', 'bigger'], { message: "Organização deve ser 'relevance', ou 'smaller', ou 'bigger'." })
    sort: string;

    @IsOptional()
    @IsString({ message: "Valor da busca inválido." })
    search?: string;

    @IsOptional()
    @IsString({ each: true, message: "Valor das categorias são inválidos." })
    categories?: string[];

    @IsOptional()
    @IsString({ each: true, message: "Valor das categorias são inválidos." })
    brands?: string[];

    @IsOptional()
    @IsString({ each: true, message: "Valor das categorias são inválidos." })
    prices?: [string, string];

    @IsOptional()
    @IsString({ each: true, message: "Valor das categorias são inválidos." })
    tags?: string[]
}