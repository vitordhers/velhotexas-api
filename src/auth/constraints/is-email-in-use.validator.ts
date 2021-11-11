import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions
} from "class-validator";
import { UsersService } from '../../users/users.service';
import { Injectable, Inject } from '@nestjs/common';

@ValidatorConstraint({ name: 'EmailIsUnique', async: true })
@Injectable()
export class IsEmailInUseConstraint implements ValidatorConstraintInterface {

  constructor(private readonly usersService: UsersService) { }

  async validate(email: string) {
    return await this.usersService.findUserByEmail(email).then(res => !res);
  }

}

export function IsEmailInUse(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailInUseConstraint
    });
  };
}