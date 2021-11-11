import { IsNotEmpty, IsString, Length, IsEmail, IsDefined } from 'class-validator';
import { GoogleRecaptchaV3 } from 'src/shared/constaints/google-recaptcha-v3.constraint';

export class ForgotPasswordDto {
    @IsDefined({ message: "Inserir o e-mail é obrigatório!" })
    @IsNotEmpty({ message: "Inserir o e-mail é obrigatório!" })
    @IsString({ message: "Valor de E-mail inválido." })
    @Length(4, 50, { message: "O E-mail deve ter entre $constraint1 e $constraint2 caracteres!" })
    @IsEmail({}, { message: "E-mail inválido!" })
    email: string;

    @IsDefined({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    @IsNotEmpty({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    @IsString()
    @GoogleRecaptchaV3({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    recaptcha: string;
}
