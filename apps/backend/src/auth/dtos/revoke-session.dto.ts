import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { SWAGGER_EXAMPLES } from 'src/common/constants/examples.constant';

export class RevokeSessionDto {
  @ApiProperty({
    description: 'ID of the refresh session to revoke',
    example: SWAGGER_EXAMPLES.sessionId,
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
