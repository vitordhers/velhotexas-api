import { IsString, Length, IsDefined, IsNotEmpty, IsEmail } from "class-validator";
import { GoogleRecaptchaV3 } from "src/shared/constaints/google-recaptcha-v3.constraint";

export class GetUserStatusDto {
    @IsDefined({ message: "Informar o e-mail é obrigatório!" })
    @IsNotEmpty({ message: "Informar o e-mail é obrigatório!" })
    @IsString({ message: "Valor do E-mail inválido." })
    @IsEmail({}, { message: "Formato do E-mail inválido." })
    @Length(4, 50, { message: "O E-mail deve ter entre $constraint1 e $constraint2 caracteres!" })
    email: string;

    @IsDefined({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    @IsNotEmpty({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    @IsString()
    @GoogleRecaptchaV3({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    recaptcha: string;
}
