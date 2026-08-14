import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SWAGGER_EXAMPLES } from 'src/common/constants/examples.constant';

export class SessionResponseDto {
  @ApiProperty({
    example: SWAGGER_EXAMPLES.sessionId,
  })
  sessionId: string;

  @ApiPropertyOptional({
    example: SWAGGER_EXAMPLES.userAgent,
    nullable: true,
  })
  userAgent: string | null;

  @ApiPropertyOptional({
    example: SWAGGER_EXAMPLES.browser,
    nullable: true,
  })
  browser: string | null;

  @ApiPropertyOptional({
    example: SWAGGER_EXAMPLES.operatingSystem,
    nullable: true,
  })
  operatingSystem: string | null;

  @ApiPropertyOptional({
    example: SWAGGER_EXAMPLES.ipAddress,
    nullable: true,
  })
  ipAddress: string | null;

  @ApiPropertyOptional({
    example: SWAGGER_EXAMPLES.location,
    nullable: true,
    description: 'Approximate location when available',
  })
  location: string | null;

  @ApiProperty({
    example: SWAGGER_EXAMPLES.createdAt,
  })
  createdAt: Date;

  @ApiProperty({
    example: SWAGGER_EXAMPLES.lastUsedAt,
  })
  lastUsedAt: Date;

  @ApiProperty({
    example: true,
    description: 'Whether this session matches the current refresh cookie',
  })
  isCurrentSession: boolean;
}

export class SessionsListResponseDto {
  @ApiProperty({ type: [SessionResponseDto] })
  sessions: SessionResponseDto[];
}
