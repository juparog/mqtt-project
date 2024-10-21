import { PaginatedResponseDto } from '@kuiiksoft/common';
import { UserResponseDto } from './user-response.dto';

export class UsersPaginatedDto extends PaginatedResponseDto<UserResponseDto> {}
