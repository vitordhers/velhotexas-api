import { IsNotEmpty, IsString, Length, IsEmail, MaxDate, IsBoolean, Equals, IsOptional, ValidateIf, IsDate } from 'class-validator';
import { isEqualPasswords } from '../constraints/is-equal-fields.validator';
import { Type, Transform } from 'class-transformer';
import { GoogleRecaptchaV3 } from 'src/shared/constaints/google-recaptcha-v3.constraint';

export class CreateUserDto {
    @IsNotEmpty({ message: "Inserir o nome é obrigatório!" })
    @IsString({ message: "Valor de Nome inválido." })
    @Length(3, 50, { message: "O nome deve ter entre $constraint1 e $constraint1 caracteres." })
    name: string;

    @IsNotEmpty({ message: "Aceitar Termos de Uso e Política de Privacidade é obrigatório para o cadastro!" })
    @IsBoolean({ message: "Valor inválido para Termos de Uso e Política de Privacidade!" })
    @Equals(true, { message: "Para prosseguir, você deve aceitar Termos de Uso e Política de Privacidade!" })
    terms: boolean;

    @IsOptional()
    @IsString()
    googleUserId?: string;

    @IsOptional()
    @IsString()
    facebookUserId?: string;

    @ValidateIf(o => o.googleUserId != null || o.facebookUserId != null)
    @IsNotEmpty({ message: "Inserir o e-mail é obrigatório!" })
    @IsString({ message: "Valor de E-mail inválido." })
    @Length(4, 50, { message: "O E-mail deve ter entre $constraint1 e $constraint2 caracteres!" })
    @IsEmail({}, { message: "E-mail inválido!" })
    // @IsEmailInUse({ message: "E-mail já registrado!" })
    email?: string;

    @ValidateIf(o => o.googleUserId != null || o.facebookUserId != null)
    @IsNotEmpty({ each: true, message: "Inserir uma senha é obrigatório" })
    @IsString({ each: true, message: "Valor de Senha inválido." })
    @Length(6, 30, { each: true, message: "A Senha deve ter entre $constraint1 e $constraint2 caracteres!" })
    @isEqualPasswords({ each: true, message: "As senhas não coincidem!" })
    passwords?: { password: string, cpassword: string };

    @ValidateIf(o => o.googleUserId != null || o.facebookUserId != null)
    @IsNotEmpty({ message: "A Data de Nascimento é obrigatória!" })
    @Type(() => Date)
    @IsDate({ message: "Data de Nascimento inválida!" })
    @MaxDate(new Date(new Date().setDate(new Date().getDate() - 6574)), { message: "Idade insuficiente para cadastro." })
    birthday?: Date;

    @ValidateIf(o => o.googleUserId != null || o.facebookUserId != null)
    @IsNotEmpty()
    @IsString()
    @GoogleRecaptchaV3({ message: "Atividade considerada suspeita pelo Google Recaptcha!" })
    recaptcha?: string;

    @Transform(value => value === "" ? null : value)
    @IsOptional()
    @IsString({ message: "Valor do Número de Celular inválido." })
    @Length(15, 15, { message: "O número de celular deve 9 caracteres." })
    celphoneNumber?: string;

    @IsOptional()
    @IsBoolean({ message: "Valor inválido para existência de Whatsapp!" })
    whatsapp?: boolean;

    @IsOptional()
    @IsBoolean({ message: "Valor inválido para recebimento de Promoções!" })
    promo?: boolean;

    @ValidateIf(o => o.promo === true)
    @IsOptional()
    @Transform((value, obj, type) => {
        if (obj.whatsapp === false || (obj.celphoneNumber && obj.celphoneNumber.length < 15)) {
            delete value.wppcomm
        }
        return { ...value, wppcomm: false }
    })
    @IsBoolean({
        each: true,
        message: "Valor inválido para recebimento de Promoções!"
    })
    communication?: { mailcomm: boolean, wppcomm: boolean };

}