import { PipeTransform, ArgumentMetadata } from "@nestjs/common";

export class CreateUserValidatorPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        console.log(value);
        console.log(metadata);
        return value;
    }
}