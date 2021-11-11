import { ValidationOptions, registerDecorator } from "class-validator";

export function isEqualPasswords(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: {
                    password: string,
                    cpassword: string
                }): boolean {
                    return value.password === value.cpassword;
                }
            }
        });
    };
}