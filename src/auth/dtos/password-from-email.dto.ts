import { IsString, Length, IsOptional, IsDefined, IsNotEmpty } from "class-validator";
import { isEqualPasswords } from "../constraints/is-equal-fields.validator";
import { GoogleRecaptchaV3 } from "src/shared/constaints/google-recaptcha-v3.constraint";

export class PasswordFromEmailDto {
    @IsOptional()
    @IsString({ each: true, message: "Valor de Senha inválido." })
    @Length(6, 30, { each: true, message: "A Senha deve ter entre $constraint1 e $constraint2 caracteres!" })
    @isEqualPasswords({ each: true, message: "As senhas não coincidem!" })
    passwords?: { password: string, cpassword: string };

    @IsDefined({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    @IsNotEmpty({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    @IsString()
    @GoogleRecaptchaV3({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    recaptcha: string;
}
