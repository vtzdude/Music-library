import { SetMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function Trim() {
  return Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrictBoolean(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrictBoolean',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Validate that the value is strictly a boolean
          return typeof value === 'boolean';
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a boolean (true or false).`;
        },
      },
    });
  };
}
