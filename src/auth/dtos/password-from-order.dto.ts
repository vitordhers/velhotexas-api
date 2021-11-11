import { IsString, Length, IsOptional, IsDefined, IsBoolean } from "class-validator";
import { isEqualPasswords } from "../constraints/is-equal-fields.validator";

export class PasswordFromOrderDto {
    @IsDefined({ message: "Inserir uma senha é obrigatório" })
    @IsString({ each: true, message: "Valor de Senha inválido." })
    @Length(6, 30, { each: true, message: "A Senha deve ter entre $constraint1 e $constraint2 caracteres!" })
    @isEqualPasswords({ each: true, message: "As senhas não coincidem!" })
    passwords: { password: string, cpassword: string };

    @IsDefined({ message: "Inserir uma senha é obrigatório" })
    @IsString({ each: true, message: "Valor de Senha inválido." })
    @IsString({ each: true, message: "Valor de Senha inválido." })
    orderId: string;

    @IsOptional()
    @IsBoolean({ message: "Valor de promo deve ser string." })
    promo?: boolean;
}