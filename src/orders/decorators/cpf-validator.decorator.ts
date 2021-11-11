import { registerDecorator, ValidationOptions } from "class-validator";

export function IsCpfValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isCpfValid",
            target: object.constructor,
            propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    let cpf: string;
                    cpf = value.replace(/\D/g, "");

                    const invalidCpfs = [
                        '00000000000', '11111111111', '22222222222', '33333333333', '44444444444',
                        '55555555555', '66666666666', '77777777777', '88888888888', '99999999999'
                    ]
                    if (invalidCpfs.includes(cpf)) { return false; }
                    // Valida 1o digito	
                    let add = 0;
                    for (let i = 0; i < 9; i++) {
                        add += parseInt(cpf.charAt(i)) * (10 - i);
                    }

                    let rev = 11 - (add % 11);
                    if (rev == 10 || rev == 11) {
                        rev = 0;
                    }
                    if (rev != parseInt(cpf.charAt(9))) {
                        return false;
                    }

                    add = 0;
                    for (let i = 0; i < 10; i++) {
                        add += parseInt(cpf.charAt(i)) * (11 - i);
                    }
                    rev = 11 - (add % 11);
                    if (rev == 10 || rev == 11) {
                        rev = 0;
                    }
                    if (rev != parseInt(cpf.charAt(10))) {
                        return false;
                    }
                    return true;
                }
            }
        });
    };
}