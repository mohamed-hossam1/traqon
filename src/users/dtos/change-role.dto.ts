import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { userRoleEnum, type UserRole } from 'src/db/schema';

export class ChangeRoleDto {
  @ApiProperty({
    enum: userRoleEnum.enumValues,
    example: 'admin',
    description: 'Target role to assign to the user',
  })
  @IsNotEmpty()
  @IsEnum(userRoleEnum.enumValues, {
    message: `Role must be one of: ${userRoleEnum.enumValues.join(', ')}`,
  })
  role: UserRole;
}
