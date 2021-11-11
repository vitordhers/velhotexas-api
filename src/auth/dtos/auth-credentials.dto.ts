import { GoogleRecaptchaV3 } from 'src/shared/constaints/google-recaptcha-v3.constraint';
import { IsNotEmpty, IsString, Length, IsEmail } from 'class-validator';

export class AuthCredentialsDto {
    @IsNotEmpty({ message: "Inserir o e-mail é obrigatório!" })
    @IsString({ message: "Valor de E-mail inválido." })
    @Length(6, 30, { message: "O nome deve ter entre $constraint1 e $constraint2 caracteres!" })
    @IsEmail({}, { message: "E-mail inválido!" })
    email: string;

    @IsNotEmpty({ each: true, message: "Inserir uma senha é obrigatório" })
    @IsString({ each: true, message: "Valor de Senha inválido." })
    @Length(6, 30, { each: true, message: "A Senha deve ter entre $constraint1 e $constraint2 caracteres!" })
    password: string;
    
    @IsNotEmpty()
    @IsString()
    @GoogleRecaptchaV3({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    recaptcha: string;
}