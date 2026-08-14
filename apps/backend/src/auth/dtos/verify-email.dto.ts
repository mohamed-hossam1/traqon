import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SWAGGER_EXAMPLES } from 'src/common/constants/examples.constant';

export class VerifyEmailDto {
  @ApiProperty({
    example: SWAGGER_EXAMPLES.token,
    required: true,
    description: 'Email verification token from the verification email link',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
