import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validation decorator to check if two properties of a class match.
 *
 *
 * @param property - The name of the property to compare with.
 * @param validationOptions - Optional options to pass to the validator (e.g., custom error message).
 *
 * @example
 * class ResetPasswordDto {
 *   @IsNotEmpty()
 *   password: string;
 *
 *   @IsNotEmpty()
 *   @Match('password', { message: 'Passwords do not match' })
 *   confirmPassword: string;
 * }
 */
export default function Match(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        /**
         * Validates that the value of the decorated property matches the value of the specified property.
         *
         * @param value - The value of the property that is decorated with @Match.
         * @param args - ValidationArguments containing the object being validated and additional constraints.
         * @returns True if the values match; otherwise, false.
         */
        async validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          // Retrieve the value of the related property from the object.
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },

        /**
         * Returns the default error message if validation fails.
         *
         * @param args - ValidationArguments providing details of the validation.
         * @returns A default error message.
         */
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `$property must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
