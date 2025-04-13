import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: "User's full name",
    example: 'Jane Doe',
  })
  name: string;

  @ApiProperty({
    description: "User's email address",
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'When the user was created',
    example: '2025-04-12T20:35:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the user was last updated',
    example: '2025-04-12T20:35:00.000Z',
  })
  updatedAt: Date;
}
