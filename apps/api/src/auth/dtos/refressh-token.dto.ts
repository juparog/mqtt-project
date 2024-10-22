import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEzZjQ5ZjIwLWYzZTktNGI2Zi1hYjUyLWQwM2IzYzY3ZjI5ZiIsImlhdCI6MTYxNzI2NzI2M30.5Gt9j1F1bW2b1X6v3z1ZI6XvqKQ9WQXKo7y5v3J5KQ',
  })
  token: string;
}
