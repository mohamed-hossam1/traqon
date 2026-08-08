import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SWAGGER_EXAMPLES } from 'src/common/constants/examples.constant';

export class UnlinkOauthAccountDto {
  @ApiProperty({
    example: SWAGGER_EXAMPLES.oauthProvider,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  provider: string;
}
