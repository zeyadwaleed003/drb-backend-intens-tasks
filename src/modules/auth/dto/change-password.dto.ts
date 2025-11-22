import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'OldPass123!',
    type: String,
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  currentPassword: string;

  @ApiProperty({
    description:
      'New password - must contain at least 8 characters including uppercase, lowercase, number, and special character',
    example: 'NewPass123!',
    minLength: 8,
    type: String,
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  @MinLength(8, {
    message: i18nValidationMessage('validation.MIN_LENGTH', {
      constraint1: 8,
    }),
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: i18nValidationMessage('validation.PASSWORD_COMPLEXITY'),
  })
  newPassword: string;
}
